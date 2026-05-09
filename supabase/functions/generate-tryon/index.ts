import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PIAPI_API_KEY = Deno.env.get("PIAPI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Fallback Tara image used when no model_id is supplied
const TARA_IMAGE_URL = "https://i.ibb.co/ycxyhNvh/tara-white.png";
const STORAGE_BUCKET = "listing-images";

// Inline polling: 12 attempts × 5 s = 60 s — safe within edge function timeout.
// Listings still processing after this are picked up by poll-tryon.
const POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 5_000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { listing_id, model_id } = await req.json();
    console.log("[generate-tryon] listing_id:", listing_id, "model_id:", model_id ?? "default");

    if (!listing_id) return json({ error: "listing_id required" }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch listing for garment image
    const { data: listing, error: listingErr } = await supabase
      .from("listings")
      .select("id, images")
      .eq("id", listing_id)
      .single();

    if (listingErr || !listing) {
      console.error("[generate-tryon] Listing not found:", listingErr);
      return json({ error: "Listing not found" }, 404);
    }

    const garmentImageUrl: string | undefined = listing.images?.[0];
    if (!garmentImageUrl) {
      console.error("[generate-tryon] Listing has no images");
      return json({ error: "Listing has no images" }, 422);
    }

    // Resolve human reference image: use model's reference_image_url or fall back to Tara
    let humanImageUrl = TARA_IMAGE_URL;
    let resolvedModelId: string | null = model_id ?? null;

    if (model_id) {
      const { data: model } = await supabase
        .from("virtual_models")
        .select("id, reference_image_url")
        .eq("id", model_id)
        .single();

      if (model?.reference_image_url) humanImageUrl = model.reference_image_url;
      resolvedModelId = model?.id ?? null;
    } else {
      // Find the default model (Tara) for listing_tryons upsert later
      const { data: defaultModel } = await supabase
        .from("virtual_models")
        .select("id")
        .eq("is_default", true)
        .single();
      resolvedModelId = defaultModel?.id ?? null;
    }

    // Mark listing as processing so the UI can show a badge
    await supabase
      .from("listings")
      .update({ tryon_status: "processing" })
      .eq("id", listing_id);

    // Submit try-on task to PiAPI / Kling
    console.log("[generate-tryon] Submitting PiAPI task — human:", humanImageUrl, "garment:", garmentImageUrl);
    const submitRes = await fetch("https://api.piapi.ai/api/v1/task", {
      method: "POST",
      headers: { "x-api-key": PIAPI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kling",
        task_type: "ai_try_on",
        input: {
          human_image: humanImageUrl,
          cloth_image: garmentImageUrl,
          mode: "quality",
        },
      }),
    });

    const submitData = await submitRes.json();
    console.log("[generate-tryon] PiAPI submit:", JSON.stringify(submitData));

    if (!submitRes.ok || submitData.code !== 200) {
      const errMsg = submitData.message ?? submitData.error ?? "PiAPI request failed";
      console.error("[generate-tryon] PiAPI submit error:", errMsg);
      await supabase
        .from("listings")
        .update({ tryon_status: "failed", tryon_error: errMsg })
        .eq("id", listing_id);
      return json({ error: errMsg }, 502);
    }

    const taskId: string = submitData.data?.task_id;
    console.log("[generate-tryon] Task ID:", taskId);

    await supabase
      .from("listings")
      .update({ tryon_task_id: taskId })
      .eq("id", listing_id);

    // Poll for completion inline (up to POLL_ATTEMPTS × POLL_INTERVAL_MS).
    // If the task is still running after this window, poll-tryon will finalise it.
    for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      console.log(`[generate-tryon] Poll ${attempt}/${POLL_ATTEMPTS} task ${taskId}`);

      const pollRes = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        headers: { "x-api-key": PIAPI_API_KEY },
      });
      const pollData = await pollRes.json();
      const taskStatus: string = pollData.data?.status ?? "";
      console.log("[generate-tryon] Task status:", taskStatus);

      if (taskStatus === "completed") {
        // Extract the generated image URL from Kling's response structure
        const works = pollData.data?.output?.works;
        const imageUrl: string | undefined =
          works?.[0]?.image?.resource_list?.[0]?.resource ??
          works?.[0]?.image?.url ??
          pollData.data?.output?.image_url;

        if (!imageUrl) {
          const msg = "No image URL in completed PiAPI response";
          console.error("[generate-tryon]", msg, JSON.stringify(pollData));
          await supabase
            .from("listings")
            .update({ tryon_status: "failed", tryon_error: msg })
            .eq("id", listing_id);
          return json({ error: msg }, 502);
        }

        // Download from PiAPI (their URLs are temporary) and re-host in our storage
        console.log("[generate-tryon] Downloading tryon image:", imageUrl);
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Image download failed: ${imgRes.status}`);
        const imgBytes = await imgRes.arrayBuffer();

        // Path includes model so multiple models can be stored per listing
        const modelKey = resolvedModelId ?? "tara";
        const storagePath = `tryon/${listing_id}/${modelKey}.jpg`;

        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, imgBytes, { contentType: "image/jpeg", upsert: true });

        if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
        const publicUrl = urlData.publicUrl;
        console.log("[generate-tryon] Stored at:", publicUrl);

        // Update listing (keeps backward-compat tryon_image_url on listing row)
        await supabase
          .from("listings")
          .update({ tryon_status: "completed", tryon_image_url: publicUrl })
          .eq("id", listing_id);

        // Upsert into listing_tryons for the per-model store (Phase 2)
        if (resolvedModelId) {
          await supabase.from("listing_tryons").upsert(
            { listing_id, model_id: resolvedModelId, tryon_image_url: publicUrl },
            { onConflict: "listing_id,model_id" }
          );
        }

        return json({ task_id: taskId, status: "completed", tryon_image_url: publicUrl });
      }

      if (taskStatus === "failed" || taskStatus === "error") {
        const errMsg =
          pollData.data?.error?.message ?? pollData.data?.output?.error ?? "PiAPI task failed";
        console.error("[generate-tryon] Task failed:", errMsg);
        await supabase
          .from("listings")
          .update({ tryon_status: "failed", tryon_error: errMsg })
          .eq("id", listing_id);
        return json({ error: errMsg }, 502);
      }
      // Still running — continue polling
    }

    // Inline polling exhausted — poll-tryon will pick this up
    console.log("[generate-tryon] Inline timeout reached; poll-tryon will finalise task:", taskId);
    return json({ task_id: taskId, status: "processing" });
  } catch (err) {
    console.error("[generate-tryon] Unhandled error:", err);
    return json({ error: String(err) }, 500);
  }
});
