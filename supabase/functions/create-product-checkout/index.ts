import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const getSiteOrigin = (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const referer = req.headers.get("referer");
  if (referer) { try { return new URL(referer).origin; } catch {} }
  return "https://najkrajsie-zviera-sk.lovable.app";
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.email) return jsonResponse({ error: "Unauthorized" }, 401);

    const { productId, productName, amount } = await req.json();
    if (!productName || !amount) return jsonResponse({ error: "Missing product data" }, 400);

    const siteOrigin = getSiteOrigin(req);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: productName, description: "E-shop NajkrajšíPes.sk – podpora útulkov" },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${siteOrigin}/eshop-dakujeme`,
      cancel_url: `${siteOrigin}/eshop`,
      metadata: { userId: userData.user.id, productId: productId || "", type: "eshop", productName },
    });

    if (!session.url) return jsonResponse({ error: "Checkout URL missing" }, 500);

    // Create pending payment record using service role
    const adminClient = createClient(supabaseUrl, serviceKey);
    await adminClient.from("payments").insert({
      user_id: userData.user.id,
      amount,
      type: "product",
      status: "pending",
      stripe_payment_intent_id: session.id,
      product_name: productName,
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Product checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
