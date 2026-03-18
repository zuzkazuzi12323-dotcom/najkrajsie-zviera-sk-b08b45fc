import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    try {
      return new URL(referer).origin;
    } catch {
      // ignore invalid referer
    }
  }

  return "https://najkrajsie-zviera-sk.lovable.app";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !stripeKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const payload = await req.json();
    const type = payload?.type as "registration" | "highlight" | undefined;
    const dogId = typeof payload?.dogId === "string" ? payload.dogId : "";
    const dogName = typeof payload?.dogName === "string" ? payload.dogName : "Pes";

    if (!type || (type !== "registration" && type !== "highlight")) {
      return jsonResponse({ error: "Invalid payment type" }, 400);
    }

    const isHighlight = type === "highlight";
    const amount = isHighlight ? 200 : 100;
    const siteOrigin = getSiteOrigin(req);

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: isHighlight ? `Zvýraznenie psa: ${dogName}` : `Registrácia psa: ${dogName}`,
              description: isHighlight
                ? "Zvýraznenie psa v súťaži NajkrajšíPes.sk"
                : "Pridanie psa do súťaže NajkrajšíPes.sk",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteOrigin}/platba-uspesna?session_id={CHECKOUT_SESSION_ID}&type=${type}&dog_id=${dogId}`,
      cancel_url: `${siteOrigin}/pridat`,
      metadata: {
        userId: userData.user.id,
        dogId,
        type,
      },
    });

    if (!session.url) {
      return jsonResponse({ error: "Nepodarilo sa vytvoriť Stripe checkout URL" }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error: paymentInsertError } = await adminClient.from("payments").insert({
      user_id: userData.user.id,
      dog_id: dogId || null,
      type: isHighlight ? "highlight" : "registration",
      amount,
      stripe_payment_intent_id: session.id,
      status: "pending",
    });

    if (paymentInsertError) {
      console.error("Payment insert error:", paymentInsertError);
      return jsonResponse({ error: "Nepodarilo sa pripraviť platbu" }, 500);
    }

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
