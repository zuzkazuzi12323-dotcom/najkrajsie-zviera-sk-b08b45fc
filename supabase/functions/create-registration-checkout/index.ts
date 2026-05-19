import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REGISTRATION_PRICE_CENTS = 299; // 2,99 €

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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

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
    const dogId = typeof payload?.dogId === "string" ? payload.dogId : "";
    const dogName = typeof payload?.dogName === "string" ? payload.dogName : "Pes";

    if (!dogId) {
      return jsonResponse({ error: "Missing dogId" }, 400);
    }

    // Verify dog belongs to the user and is not yet approved
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: dog } = await admin
      .from("dogs")
      .select("id, owner_id, approved")
      .eq("id", dogId)
      .single();
    if (!dog || dog.owner_id !== userData.user.id) {
      return jsonResponse({ error: "Dog not found" }, 404);
    }

    const siteOrigin = getSiteOrigin(req);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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
              name: `Registrácia psa: ${dogName}`,
              description: `Jednorazový poplatok za zaradenie psa ${dogName} do súťaže NajkrajšíPes.sk`,
            },
            unit_amount: REGISTRATION_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteOrigin}/platba-uspesna?session_id={CHECKOUT_SESSION_ID}&type=registration&dog_id=${dogId}`,
      cancel_url: `${siteOrigin}/registracia-zrusena?dog_id=${dogId}`,
      metadata: {
        userId: userData.user.id,
        dogId,
        type: "registration",
      },
    });

    if (!session.url) {
      return jsonResponse({ error: "Nepodarilo sa vytvoriť checkout" }, 500);
    }

    await admin.from("payments").insert({
      user_id: userData.user.id,
      dog_id: dogId,
      type: "registration",
      amount: REGISTRATION_PRICE_CENTS,
      stripe_payment_intent_id: session.id,
      status: "pending",
      product_name: `Registrácia psa: ${dogName}`,
    });

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Registration checkout error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
