import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function commissionRate(isFoundingSeller: boolean, isVipListing: boolean): number {
  if (isVipListing) return 0.25;
  if (isFoundingSeller) return 0.08;
  return 0.10;
}

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
    const { listing_id, buyer_id } = await req.json();

    if (!listing_id || !buyer_id) {
      return new Response(JSON.stringify({ error: "listing_id and buyer_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch listing with seller profile
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*, profiles!seller_id(stripe_account_id, is_founding_seller, is_vip_seller)")
      .eq("id", listing_id)
      .eq("is_active", true)
      .eq("is_sold", false)
      .single();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found or unavailable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const seller = listing.profiles as {
      stripe_account_id: string | null;
      is_founding_seller: boolean;
      is_vip_seller: boolean;
    };

    // Commission calculation
    const postage = listing.free_postage ? 0 : (listing.postage_price ?? 0);
    const totalAmount = listing.price + postage;
    const rate = commissionRate(seller.is_founding_seller, listing.is_vip_verified);
    const platformFee = Math.round(listing.price * rate);
    const sellerPayout = totalAmount - platformFee;

    // Create pending order first so we have an ID for the success URL
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        listing_id,
        buyer_id,
        seller_id: listing.seller_id,
        amount: totalAmount,
        status: "pending",
        platform_fee_amount: platformFee,
        seller_payout_amount: sellerPayout,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isTestMode = !seller.stripe_account_id || seller.stripe_account_id === "acct_test_placeholder";

    // Build Stripe Checkout params
    const params: Record<string, string> = {
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": String(listing.price),
      "line_items[0][price_data][product_data][name]": listing.title,
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `https://www.dobaara.co/orders/${order.id}?success=true`,
      cancel_url: `https://www.dobaara.co/listing/${listing_id}`,
      "metadata[listing_id]": listing_id,
      "metadata[buyer_id]": buyer_id,
      "metadata[seller_id]": listing.seller_id,
      "metadata[order_id]": order.id,
    };

    if (!isTestMode) {
      params["payment_intent_data[application_fee_amount]"] = String(platformFee);
      params["payment_intent_data[transfer_data][destination]"] = seller.stripe_account_id!;
    } else {
      // TEST MODE - no transfer
    }

    // Add postage as a separate line item if applicable
    if (postage > 0) {
      params["line_items[1][price_data][currency]"] = "gbp";
      params["line_items[1][price_data][unit_amount]"] = String(postage);
      params["line_items[1][price_data][product_data][name]"] = "Postage & Packaging";
      params["line_items[1][quantity]"] = "1";
    }

    const session = await stripePost("/checkout/sessions", params);

    if (session.error) {
      // Clean up the pending order if Stripe failed
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store the checkout session ID on the order for reconciliation
    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: session.payment_intent })
      .eq("id", order.id);

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-create-checkout] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
