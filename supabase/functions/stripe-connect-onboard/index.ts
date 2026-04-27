import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { user_id, return_url, refresh_url } = await req.json();

    if (!user_id || !return_url || !refresh_url) {
      return new Response(JSON.stringify({ error: "user_id, return_url, refresh_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user_id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe account if seller doesn't have one yet
    let stripeAccountId = profile.stripe_account_id;
    if (!stripeAccountId) {
      const account = await stripePost("/accounts", {
        type: "standard",
        country: "GB",
        email: user.email,
        "capabilities[card_payments][requested]": "true",
        "capabilities[transfers][requested]": "true",
      });

      if (account.error) {
        return new Response(JSON.stringify({ error: account.error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      stripeAccountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user_id);
    }

    // Create Account Link for hosted onboarding
    const accountLink = await stripePost("/account_links", {
      account: stripeAccountId,
      return_url,
      refresh_url,
      type: "account_onboarding",
    });

    if (accountLink.error) {
      return new Response(JSON.stringify({ error: accountLink.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: accountLink.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
