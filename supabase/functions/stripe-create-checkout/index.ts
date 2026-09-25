import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Fee calculation ───────────────────────────────────────────────────────────

interface FeeBreakdown {
  itemPricePence: number;
  postagePence: number;
  buyerProtectionFeePence: number;
  platformFeePence: number;
  sellerPayoutPence: number;
  totalChargePence: number;
  isVerified: boolean;
}

function calcFees(itemPricePence: number, postagePence: number, isVipVerified: boolean): FeeBreakdown {
  if (isVipVerified) {
    const platformFeePence = Math.round(itemPricePence * 0.25);
    return {
      itemPricePence,
      postagePence,
      buyerProtectionFeePence: 0,
      platformFeePence,
      sellerPayoutPence: itemPricePence - platformFeePence,
      totalChargePence: itemPricePence + postagePence,
      isVerified: true,
    };
  }
  // Standard: buyer pays 3.5% + £0.30 flat; seller receives 100% of item price.
  const buyerProtectionFeePence = Math.round(itemPricePence * 0.035) + 30;
  return {
    itemPricePence,
    postagePence,
    buyerProtectionFeePence,
    platformFeePence: buyerProtectionFeePence,
    sellerPayoutPence: itemPricePence,
    totalChargePence: itemPricePence + buyerProtectionFeePence + postagePence,
    isVerified: false,
  };
}

// ── Stripe helper ─────────────────────────────────────────────────────────────

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

// ── Handler ───────────────────────────────────────────────────────────────────

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

    // Verify the caller is the buyer
    const authHeader = req.headers.get("Authorization") ?? "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user || authData.user.id !== buyer_id) {
      return new Response(JSON.stringify({ error: "Not authorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const postagePence = listing.free_postage ? 0 : (listing.postage_price ?? 0);
    const fees = calcFees(listing.price, postagePence, listing.is_vip_verified);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        listing_id,
        buyer_id,
        seller_id: listing.seller_id,
        amount: fees.totalChargePence,
        status: "pending",
        platform_fee_amount: fees.platformFeePence,
        seller_payout_amount: fees.sellerPayoutPence,
        buyer_protection_fee_pence: fees.buyerProtectionFeePence,
        postage_cost_pence: fees.postagePence,
        seller_payout_pence: fees.sellerPayoutPence,
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

    // ── Line items ────────────────────────────────────────────────────────────

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

    let lineIndex = 1;

    // Standard listings: buyer protection as an explicit line item
    if (!listing.is_vip_verified) {
      params[`line_items[${lineIndex}][price_data][currency]`] = "gbp";
      params[`line_items[${lineIndex}][price_data][unit_amount]`] = String(fees.buyerProtectionFeePence);
      params[`line_items[${lineIndex}][price_data][product_data][name]`] = "Buyer Protection";
      params[`line_items[${lineIndex}][price_data][product_data][description]`] =
        "Dispute resolution, secure payment holding and guaranteed tracking";
      params[`line_items[${lineIndex}][quantity]`] = "1";
      lineIndex++;
    }

    if (postagePence > 0) {
      params[`line_items[${lineIndex}][price_data][currency]`] = "gbp";
      params[`line_items[${lineIndex}][price_data][unit_amount]`] = String(postagePence);
      params[`line_items[${lineIndex}][price_data][product_data][name]`] = "Postage & Packaging";
      params[`line_items[${lineIndex}][quantity]`] = "1";
    }

    // ── Connect / payment intent data ─────────────────────────────────────────

    if (!isTestMode) {
      const connectedAccountId = seller.stripe_account_id;
      if (!connectedAccountId) {
        throw new Error("Seller payment account is unavailable");
      }
      params["payment_intent_data[application_fee_amount]"] = String(fees.platformFeePence);
      params["payment_intent_data[transfer_data][destination]"] = connectedAccountId;

      if (!listing.is_vip_verified) {
        // Standard: explicit transfer amount = item price only.
        // Postage and buyer protection fee remain on the platform account.
        params["payment_intent_data[transfer_data][amount]"] = String(listing.price);
      }
      // Verified: no explicit transfer amount — Stripe implicitly transfers
      // (total - application_fee_amount) to the connected account.
    }

    const session = await stripePost("/checkout/sessions", params);

    if (session.error) {
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
