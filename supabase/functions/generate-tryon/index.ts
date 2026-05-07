import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PIAPI_KEY = Deno.env.get("PIAPI_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const TARA_IMAGE_URL = "https://i.ibb.co/ycxyhNvh/tara-white.png";
const STORAGE_BUCKET = "listing-images";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[generate-tryon] Request received:", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { listing_id } = await req.json();
    console.log("[generate-tryon] listing_id:", listing_id);

    if (!listing_id) {
      return new Response(JSON.stringify({ error: "listing_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, images, title")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      console.error("[generate-tryon] Listing not found:", listingError);
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const garmentImageUrl = listing.images?.[0];
    if (!garmentImageUrl) {
      console.error("[generate-tryon] No images on listing");
      return new Response(JSON.stringify({ error: "Listing has no images" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[generate-tryon] Tara image URL:", TARA_IMAGE_URL);
    console.log("[generate-tryon] Garment image URL:", garmentImageUrl);

    // Mark as processing
    await supabase
      .from("listings")
      .update({ tryon_status: "processing" })
      .eq("id", listing_id);

    // Call PiAPI Kling virtual try-on
    console.log("[generate-tryon] Calling PiAPI Kling ai_try_on");
    const piRes = await fetch("https://api.piapi.ai/api/v1/task", {
      method: "POST",
      headers: {
        "x-api-key": PIAPI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kling",
        task_type: "ai_try_on",
        input: {
          model_input: TARA_IMAGE_URL,
          dress_input: garmentImageUrl,
          batch_size: 1,
          prompt: "Full length South Asian lehenga choli, long maxi skirt reaching the floor, separate crop blouse top, dupatta scarf draped over left shoulder, traditional Indian bridal occasion wear, ankle length or floor length skirt, do not shorten the skirt",
        },
      }),
    });

    const piData = await piRes.json();
    console.log("[generate-tryon] PiAPI response:", JSON.stringify(piData));

    if (!piRes.ok || piData.code !== 200) {
      const errMsg = piData.message ?? piData.error ?? "PiAPI request failed";
      console.error("[generate-tryon] PiAPI error:", errMsg);
      await supabase
        .from("listings")
        .update({ tryon_status: "failed", tryon_error: errMsg })
        .eq("id", listing_id);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const taskId = piData.data?.task_id;
    console.log("[generate-tryon] Task ID:", taskId);

    await supabase
      .from("listings")
      .update({ tryon_task_id: taskId })
      .eq("id", listing_id);

    return new Response(JSON.stringify({ task_id: taskId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-tryon] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
