import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getSiteOrigin = (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const referer = req.headers.get("referer");
  if (referer) {
    try { return new URL(referer).origin; } catch { /* ignore */ }
  }
  return "https://najkrajsie-zviera-sk.lovable.app";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return jsonResponse({ error: "Server configuration error" }, 500);

    const { amount } = await req.json();
    // Accept any amount >= 100 cents (1€)
    if (typeof amount !== "number" || amount < 100 || amount > 100000) {
      return jsonResponse({ error: "Neplatná suma (min 1 €, max 1000 €)" }, 400);
    }

    const label = `${(amount / 100).toFixed(2).replace(".", ",")} €`;
    const siteOrigin = getSiteOrigin(req);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Príspevok pre útulky: ${label}`,
              description: "Jednorazový príspevok na podporu útulkov pre zvieratá",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteOrigin}/dakujeme-za-prispevok`,
      cancel_url: `${siteOrigin}/podporit`,
      metadata: { type: "donation", amount: String(amount) },
    });

    if (!session.url) return jsonResponse({ error: "Nepodarilo sa vytvoriť platbu" }, 500);
    return jsonResponse({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Donation checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
