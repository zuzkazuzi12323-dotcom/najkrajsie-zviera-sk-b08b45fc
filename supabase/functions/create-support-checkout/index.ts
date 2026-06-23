import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const payload = await req.json();
    const amount = Number(payload?.amount);
    if (!Number.isFinite(amount) || amount < 100 || amount > 100000) {
      return jsonResponse({ error: "Neplatná suma (min 1 €, max 1000 €)" }, 400);
    }

    const isAnonymous = payload?.isAnonymous === true;
    const showComment = payload?.showComment === true;
    const name = isAnonymous ? "" : String(payload?.name ?? "").trim().slice(0, 80);
    const comment = String(payload?.comment ?? "").trim().slice(0, 300);

    const label = `${(amount / 100).toFixed(2).replace(".", ",")} €`;
    const siteOrigin = getSiteOrigin(req);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Podpora platformy NajkrajšíPes.sk: ${label}`,
              description: "Dobrovoľný príspevok na prevádzku projektu (20 % putuje útulkom)",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteOrigin}/podpora-dakujeme`,
      cancel_url: `${siteOrigin}/podpora`,
      metadata: {
        type: "platform_support",
        amount: String(amount),
        name,
        is_anonymous: isAnonymous ? "1" : "0",
        comment,
        show_comment: showComment ? "1" : "0",
      },
    });

    if (!session.url) return jsonResponse({ error: "Nepodarilo sa vytvoriť platbu" }, 500);
    return jsonResponse({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Support checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
