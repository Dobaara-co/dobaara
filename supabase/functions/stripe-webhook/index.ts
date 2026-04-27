import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const signed = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return expected === signature;
}

async function sendEmailNotification(to: string, subject: string, html: string) {
  await fetch(SEND_EMAIL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ to, subject, html }),
  });
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function saleEmailHtml(itemName: string, salePrice: number, payoutAmount: number): string {
  return `
    <div style="font-family:sans-serif;background:#FAF7F2;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8ddd0">
        <div style="background:#8B5E3C;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.08em">DOBAARA</h1>
          <p style="margin:4px 0 0;color:#C9A84C;font-size:13px">You've made a sale! 🎉</p>
        </div>
        <div style="padding:28px 32px;color:#3d2b1f">
          <p style="font-size:16px;margin:0 0 16px">Great news — your item has sold!</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600;width:140px">Item</td><td style="padding:8px 0">${itemName}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Sale price</td><td style="padding:8px 0">${formatPence(salePrice)}</td></tr>
            <tr><td style="padding:8px 0;color:#8B5E3C;font-weight:600">Your payout</td><td style="padding:8px 0;font-weight:600">${formatPence(payoutAmount)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#fef9f0;border:1px solid #e8ddd0;border-radius:8px;font-size:14px">
            <strong>Next step:</strong> Please dispatch the item within 3 days. Your payout will be processed within 7 days of delivery confirmation.
          </div>
        </div>
        <div style="background:#f9f4ef;padding:16px 32px;font-size:12px;color:#999;border-top:1px solid #e8ddd0">
          Dobaara · dobaara.co
        </div>
      </div>
    </div>
  `;
}

function paymentFailedHtml(itemName: string): string {
  return `
    <div style="font-family:sans-serif;background:#FAF7F2;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8ddd0">
        <div style="background:#8B5E3C;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.08em">DOBAARA</h1>
        </div>
        <div style="padding:28px 32px;color:#3d2b1f">
          <p style="font-size:16px;margin:0 0 12px">Your payment for <strong>${itemName}</strong> could not be processed.</p>
          <p style="font-size:14px;color:#666">Please check your card details and try again, or use a different payment method.</p>
          <a href="https://www.dobaara.co/browse" style="display:inline-block;margin-top:20px;background:#8B5E3C;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
            Browse listings
          </a>
        </div>
        <div style="background:#f9f4ef;padding:16px 32px;font-size:12px;color:#999;border-top:1px solid #e8ddd0">
          Dobaara · dobaara.co
        </div>
      </div>
    </div>
  `;
}

serve(async (req) => {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  const valid = await verifyStripeSignature(payload, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { order_id, seller_id, listing_id } = session.metadata ?? {};

    if (order_id) {
      await supabase
        .from("orders")
        .update({
          status: "payment_confirmed",
          stripe_payment_intent_id: session.payment_intent,
          stripe_charge_id: session.payment_intent,
        })
        .eq("id", order_id);
    }

    if (listing_id) {
      await supabase
        .from("listings")
        .update({ is_sold: true, is_active: false })
        .eq("id", listing_id);
    }

    // Email the seller
    if (seller_id && order_id) {
      const { data: order } = await supabase
        .from("orders")
        .select("seller_payout_amount, amount, listings(title)")
        .eq("id", order_id)
        .single();

      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", seller_id)
        .single();

      if (order && sellerProfile) {
        const { data: { user } } = await supabase.auth.admin.getUserById(seller_id);
        if (user?.email) {
          const listing = order.listings as unknown as { title: string } | null;
          await sendEmailNotification(
            user.email,
            "You've made a sale on Dobaara! 🎉",
            saleEmailHtml(
              listing?.title ?? "Your item",
              order.amount,
              order.seller_payout_amount ?? 0,
            ),
          );
        }
      }
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    // Find the order by payment_intent_id
    const { data: order } = await supabase
      .from("orders")
      .select("id, buyer_id, listings(title)")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (order) {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      const { data: { user } } = await supabase.auth.admin.getUserById(order.buyer_id);
      if (user?.email) {
        const listing = order.listings as unknown as { title: string } | null;
        await sendEmailNotification(
          user.email,
          "Your Dobaara payment failed",
          paymentFailedHtml(listing?.title ?? "your item"),
        );
      }
    }
  } else if (event.type === "account.updated") {
    const account = event.data.object;
    const stripeAccountId: string = account.id;
    const chargesEnabled: boolean = account.charges_enabled;
    const payoutsEnabled: boolean = account.payouts_enabled;

    await supabase
      .from("profiles")
      .update({
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
        stripe_onboarding_complete: chargesEnabled,
      })
      .eq("stripe_account_id", stripeAccountId);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
