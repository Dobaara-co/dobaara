import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PIAPI_KEY = Deno.env.get("PIAPI_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const STORAGE_BUCKET = "listing-images";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[poll-tryon] Request received:", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find all listings currently processing
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, images, tryon_task_id")
      .eq("tryon_status", "processing")
      .not("tryon_task_id", "is", null);

    if (error) {
      console.error("[poll-tryon] DB query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[poll-tryon] Processing listings:", listings?.length ?? 0);

    const results: Record<string, string> = {};

    for (const listing of listings ?? []) {
      const taskId = listing.tryon_task_id;
      console.log("[poll-tryon] Checking task:", taskId, "for listing:", listing.id);

      try {
        const res = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
          headers: { "x-api-key": PIAPI_KEY },
        });
        const data = await res.json();
        console.log("[poll-tryon] Task status response:", JSON.stringify(data));

        const taskStatus: string = data.data?.status ?? "";

        if (taskStatus === "completed") {
          // Extract image URL from PiAPI response
          // PiAPI Kling output structure: data.output.works[0].image.resource_list[0].resource
          const works = data.data?.output?.works;
          const imageUrl: string | undefined =
            works?.[0]?.image?.resource_list?.[0]?.resource ??
            works?.[0]?.image?.url ??
            data.data?.output?.image_url;

          if (!imageUrl) {
            console.error("[poll-tryon] No image URL in completed response:", JSON.stringify(data));
            await supabase
              .from("listings")
              .update({ tryon_status: "failed", tryon_error: "No image URL in response" })
              .eq("id", listing.id);
            results[listing.id] = "failed:no_image_url";
            continue;
          }

          // Download the generated image
          console.log("[poll-tryon] Downloading image from:", imageUrl);
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) {
            throw new Error(`Failed to download image: ${imgRes.status}`);
          }
          const imgBlob = await imgRes.arrayBuffer();

          // Upload to Supabase Storage
          const storagePath = `tryon/${listing.id}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, imgBlob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
          }

          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath);
          const publicUrl = urlData.publicUrl;

          // Prepend tryon image to listing images array as the hero shot
          const updatedImages = [publicUrl, ...(listing.images ?? [])];

          await supabase
            .from("listings")
            .update({
              tryon_status: "completed",
              tryon_image_url: publicUrl,
              images: updatedImages,
              primary_image_index: 0,
            })
            .eq("id", listing.id);

          console.log("[poll-tryon] Completed listing:", listing.id, "tryon URL:", publicUrl);
          results[listing.id] = "completed";
        } else if (taskStatus === "failed" || taskStatus === "error") {
          const errMsg = data.data?.error?.message ?? data.data?.output?.error ?? "Task failed";
          console.error("[poll-tryon] Task failed for listing:", listing.id, errMsg);
          await supabase
            .from("listings")
            .update({ tryon_status: "failed", tryon_error: errMsg })
            .eq("id", listing.id);
          results[listing.id] = `failed:${errMsg}`;
        } else {
          // Still processing (pending/running)
          console.log("[poll-tryon] Task still running:", taskId, "status:", taskStatus);
          results[listing.id] = `processing:${taskStatus}`;
        }
      } catch (taskErr) {
        console.error("[poll-tryon] Error processing task for listing:", listing.id, taskErr);
        results[listing.id] = `error:${String(taskErr)}`;
      }
    }

    return new Response(JSON.stringify({ processed: Object.keys(results).length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[poll-tryon] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
