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
  if (referer) { try { return new URL(referer).origin; } catch { /* ignore */ } }
  return "https://najkrajsie-zviera-sk.lovable.app";
};

const BOOK_PRICE_CENTS = 2999;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return jsonResponse({ error: "Server configuration error" }, 500);

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") return jsonResponse({ error: "Chýba objednávka" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await admin
      .from("book_orders")
      .select("id, dog_name, email, status")
      .eq("id", orderId)
      .single();
    if (!order) return jsonResponse({ error: "Objednávka sa nenašla" }, 404);

    const siteOrigin = getSiteOrigin(req);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      customer_email: order.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Kniha o psovi – ${order.dog_name}`,
            description: "10 strán A5, mäkká lesklá väzba, tlač, doprava ZADARMO + PDF do e-mailu",
          },
          unit_amount: BOOK_PRICE_CENTS,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${siteOrigin}/kniha?stav=uspesna`,
      cancel_url: `${siteOrigin}/kniha?stav=zrusena`,
      metadata: { type: "book", orderId: order.id },
    });

    if (!session.url) return jsonResponse({ error: "Nepodarilo sa vytvoriť platbu" }, 500);

    await admin.from("book_orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return jsonResponse({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Book checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
