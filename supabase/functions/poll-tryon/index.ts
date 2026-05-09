import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fallback for listings that were still processing after generate-tryon's inline timeout
const PIAPI_API_KEY = Deno.env.get("PIAPI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const STORAGE_BUCKET = "listing-images";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find all listings still waiting for a result
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, tryon_task_id")
      .eq("tryon_status", "processing")
      .not("tryon_task_id", "is", null);

    if (error) {
      console.error("[poll-tryon] DB query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    console.log("[poll-tryon] Listings to check:", listings?.length ?? 0);

    const results: Record<string, string> = {};

    for (const listing of listings ?? []) {
      const taskId = listing.tryon_task_id;

      try {
        const res = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
          headers: { "x-api-key": PIAPI_API_KEY },
        });
        const data = await res.json();
        const taskStatus: string = data.data?.status ?? "";
        console.log("[poll-tryon] Task", taskId, "status:", taskStatus);

        if (taskStatus === "completed") {
          // Extract image URL from Kling response
          const works = data.data?.output?.works;
          const imageUrl: string | undefined =
            works?.[0]?.image?.resource_list?.[0]?.resource ??
            works?.[0]?.image?.url ??
            data.data?.output?.image_url;

          if (!imageUrl) {
            console.error("[poll-tryon] No image URL for listing:", listing.id);
            await supabase
              .from("listings")
              .update({ tryon_status: "failed", tryon_error: "No image URL in response" })
              .eq("id", listing.id);
            results[listing.id] = "failed:no_image_url";
            continue;
          }

          // Download from PiAPI and store permanently in Supabase Storage
          console.log("[poll-tryon] Downloading image for listing:", listing.id);
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) throw new Error(`Image download failed: ${imgRes.status}`);
          const imgBytes = await imgRes.arrayBuffer();

          // Use tara key for fallback listings that have no model context
          const storagePath = `tryon/${listing.id}/tara.jpg`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, imgBytes, { contentType: "image/jpeg", upsert: true });

          if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

          const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
          const publicUrl = urlData.publicUrl;

          await supabase
            .from("listings")
            .update({ tryon_status: "completed", tryon_image_url: publicUrl })
            .eq("id", listing.id);

          // Upsert into listing_tryons for the default (Tara) model
          const { data: taraModel } = await supabase
            .from("virtual_models")
            .select("id")
            .eq("is_default", true)
            .single();

          if (taraModel) {
            await supabase.from("listing_tryons").upsert(
              { listing_id: listing.id, model_id: taraModel.id, tryon_image_url: publicUrl },
              { onConflict: "listing_id,model_id" }
            );
          }

          console.log("[poll-tryon] Completed listing:", listing.id);
          results[listing.id] = "completed";
        } else if (taskStatus === "failed" || taskStatus === "error") {
          const errMsg =
            data.data?.error?.message ?? data.data?.output?.error ?? "Task failed";
          console.error("[poll-tryon] Task failed for listing:", listing.id, errMsg);
          await supabase
            .from("listings")
            .update({ tryon_status: "failed", tryon_error: errMsg })
            .eq("id", listing.id);
          results[listing.id] = `failed:${errMsg}`;
        } else {
          results[listing.id] = `processing:${taskStatus}`;
        }
      } catch (taskErr) {
        console.error("[poll-tryon] Error for listing:", listing.id, taskErr);
        results[listing.id] = `error:${String(taskErr)}`;
      }
    }

    return new Response(
      JSON.stringify({ processed: Object.keys(results).length, results }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[poll-tryon] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
