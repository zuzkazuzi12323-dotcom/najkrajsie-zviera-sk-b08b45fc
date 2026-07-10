import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const sendConfirmationWithRetry = async (
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  opts: {
    functionName: "send-payment-confirmation" | "send-support-confirmation";
    paymentId?: string | null;
    stripeSessionId: string;
    recipientEmail: string;
    templateName: string;
    paymentType: string;
    variableSymbol: string;
    amountCents: number;
    itemName: string;
    body: Record<string, unknown>;
  },
) => {
  const { data: logRow } = await supabase
    .from("email_delivery_log")
    .insert({
      payment_id: opts.paymentId || null,
      stripe_session_id: opts.stripeSessionId,
      recipient_email: opts.recipientEmail,
      template_name: opts.templateName,
      payment_type: opts.paymentType,
      variable_symbol: opts.variableSymbol,
      amount_cents: opts.amountCents,
      item_name: opts.itemName,
      status: "pending",
    })
    .select("id")
    .single();

  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/${opts.functionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify(opts.body),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Email function failed [${response.status}]: ${text}`);

      if (logRow?.id) {
        await supabase
          .from("email_delivery_log")
          .update({ status: "sent", attempts: attempt, sent_at: new Date().toISOString(), last_error: null })
          .eq("id", logRow.id);
      }
      if (opts.paymentId) {
        await supabase
          .from("payments")
          .update({ confirmation_email_sent: true, confirmation_email_at: new Date().toISOString(), confirmation_email_error: null, payer_email: opts.recipientEmail })
          .eq("id", opts.paymentId);
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`Confirmation email attempt ${attempt} failed:`, lastError);
    }
  }

  if (logRow?.id) {
    await supabase
      .from("email_delivery_log")
      .update({ status: "failed", attempts: 3, last_error: lastError })
      .eq("id", logRow.id);
  }
  if (opts.paymentId) {
    await supabase
      .from("payments")
      .update({ confirmation_email_sent: false, confirmation_email_error: lastError, payer_email: opts.recipientEmail })
      .eq("id", opts.paymentId);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

        // Send confirmation email to the payer
        const recipient = session.customer_details?.email;
        if (recipient) {
          await sendConfirmationWithRetry(supabase, supabaseUrl, serviceKey, {
            functionName: "send-support-confirmation",
            paymentId: null,
            stripeSessionId: session.id,
            recipientEmail: recipient,
            templateName: "support-confirmation",
            paymentType: "donation",
            variableSymbol: session.id,
            amountCents,
            itemName: "Príspevok útulkom",
            body: { email: recipient, type: "donation", amount: amountCents, name: session.customer_details?.name || "", variableSymbol: session.id, paymentId: session.id },
          });
        }
      }
    }

    // Handle platform support payments (voluntary contributions)
    if (type === "platform_support") {
      const amountCents = session.amount_total || parseInt(session.metadata?.amount || "0");
      if (amountCents > 0) {
        const meta = session.metadata || {};
        const { error: supError } = await supabase.from("platform_supporters").insert({
          name: meta.name || null,
          is_anonymous: meta.is_anonymous === "1",
          comment: meta.comment || null,
          show_comment: meta.show_comment === "1",
          amount_cents: amountCents,
          status: "completed",
        });
        if (supError) console.error("Supporter insert error:", supError);

        // 20% of platform support goes to shelters
        const { error: donErr } = await supabase.rpc("add_donation", { payment_amount: amountCents });
        if (donErr) console.error("Support donation update error:", donErr);
        console.log("Platform support of", amountCents, "cents recorded");

        // Send confirmation email to the payer
        const recipient = session.customer_details?.email;
        if (recipient) {
          await sendConfirmationWithRetry(supabase, supabaseUrl, serviceKey, {
            functionName: "send-support-confirmation",
            paymentId: null,
            stripeSessionId: session.id,
            recipientEmail: recipient,
            templateName: "support-confirmation",
            paymentType: "platform_support",
            variableSymbol: session.id,
            amountCents,
            itemName: "Podpora platformy",
            body: { email: recipient, type: "platform_support", amount: amountCents, name: meta.name || session.customer_details?.name || "", variableSymbol: session.id, paymentId: session.id },
          });
        }
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
            const { data: paymentRow } = await supabase
              .from("payments")
              .select("id, amount")
              .eq("stripe_payment_intent_id", session.id)
              .single();
            await sendConfirmationWithRetry(supabase, supabaseUrl, serviceKey, {
              functionName: "send-payment-confirmation",
              paymentId: paymentRow?.id || existingPayment?.id || null,
              stripeSessionId: session.id,
              recipientEmail: recipient,
              templateName: "registration-confirmation",
              paymentType: "registration",
              variableSymbol: session.id,
              amountCents: paymentRow?.amount || existingPayment?.amount || 299,
              itemName: `Registrácia psa: ${dogRow.name}`,
              body: { email: recipient, dogName: dogRow.name, dogId, variableSymbol: session.id, paymentId: paymentRow?.id || existingPayment?.id || session.id, amount: paymentRow?.amount || existingPayment?.amount || 299 },
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
