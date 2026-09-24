import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOOST_PRICES_PENCE: Record<string, number> = {
  featured: 299,
  spotlight: 599,
};

const BOOST_LABELS: Record<string, string> = {
  featured: "Featured Boost (7 days)",
  spotlight: "Spotlight Boost (7 days)",
};

async function stripePost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { listing_id, seller_id, boost_type } = await req.json();

    if (!listing_id || !seller_id || !boost_type) {
      return new Response(JSON.stringify({ error: "listing_id, seller_id and boost_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["featured", "spotlight"].includes(boost_type)) {
      return new Response(JSON.stringify({ error: "boost_type must be featured or spotlight" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization") ?? "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user || authData.user.id !== seller_id) {
      return new Response(JSON.stringify({ error: "Not authorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, seller_id, is_active")
      .eq("id", listing_id)
      .eq("seller_id", seller_id)
      .eq("is_active", true)
      .single();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found or not yours" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountPence = BOOST_PRICES_PENCE[boost_type];

    const params: Record<string, string> = {
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": String(amountPence),
      "line_items[0][price_data][product_data][name]": `${BOOST_LABELS[boost_type]} — ${listing.title}`,
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `https://www.dobaara.co/listing/${listing_id}?boost=success`,
      cancel_url: `https://www.dobaara.co/listing/${listing_id}`,
      "metadata[type]": "boost",
      "metadata[listing_id]": listing_id,
      "metadata[seller_id]": seller_id,
      "metadata[boost_type]": boost_type,
      "metadata[amount_pence]": String(amountPence),
    };

    const session = await stripePost("/checkout/sessions", params);

    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[create-boost-checkout] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
