import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
      },
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error("Missing env vars");
    return new Response("Server config error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-08-27.basil",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log("Processing event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, dogId, type } = session.metadata || {};

    // Update payment status - check if already completed to prevent duplicates
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status, amount")
      .eq("stripe_payment_intent_id", session.id)
      .single();

    if (existingPayment && existingPayment.status !== "completed") {
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_payment_intent_id", session.id);

      if (paymentError) {
        console.error("Payment update error:", paymentError);
      } else {
        console.log("Payment marked completed for session:", session.id);

        // Add 20% to donations total (prevent duplicate by only doing this on status change)
        const { error: donationError } = await supabase.rpc("add_donation", {
          payment_amount: existingPayment.amount,
        });
        if (donationError) {
          console.error("Donation update error:", donationError);
        } else {
          console.log("Added 20% of", existingPayment.amount, "to donations total");
        }
      }
    }

    // Handle direct donation payments (no payment record exists)
    if (type === "donation") {
      const amountCents = session.amount_total || parseInt(session.metadata?.amount || "0");
      if (amountCents > 0) {
        // For direct donations, 100% goes to shelters, so pass amount * 5 to get full amount from the 20% function
        // Actually simpler: just manually update
        const { data: current } = await supabase
          .from("donations_total")
          .select("total_cents")
          .eq("id", "00000000-0000-0000-0000-000000000001")
          .single();
        
        await supabase
          .from("donations_total")
          .update({ total_cents: (current?.total_cents || 0) + amountCents, updated_at: new Date().toISOString() })
          .eq("id", "00000000-0000-0000-0000-000000000001");
        console.log("Direct donation of", amountCents, "cents added to total");
      }
    }

    // If registration payment, approve dog & send confirmation email
    if (type === "registration" && dogId) {
      const { data: dogRow, error: approveError } = await supabase
        .from("dogs")
        .update({ approved: true })
        .eq("id", dogId)
        .select("name, owner_id")
        .single();

      if (approveError) {
        console.error("Dog approve error:", approveError);
      } else {
        console.log("Dog approved after payment:", dogId);
        // Send payment confirmation email
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", dogRow?.owner_id)
            .single();
          const recipient = profile?.email || session.customer_details?.email;
          if (recipient && dogRow) {
            await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({ email: recipient, dogName: dogRow.name, dogId }),
            });
          }
        } catch (e) {
          console.error("Payment confirmation email error:", e);
        }
      }
    }

    // If highlight payment, update dog
    if (type === "highlight" && dogId) {
      const { error: dogError } = await supabase
        .from("dogs")
        .update({ highlighted: true })
        .eq("id", dogId);

      if (dogError) console.error("Dog highlight error:", dogError);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
