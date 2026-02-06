import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to database plan values
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1Sxe4kRwAhX06SSdjtd46Hiu": "intermediate", // Basic -> intermediate in DB
  "price_1Sxe5JRwAhX06SSd1xJqgQZg": "advanced",     // Pro -> advanced in DB
  "price_1Sxe5tRwAhX06SSdxzdFb1Bh": "elite",        // Elite -> elite in DB
};

// Map price IDs to plan keys for events
const PRICE_TO_PLAN_KEY: Record<string, string> = {
  "price_1Sxe4kRwAhX06SSdjtd46Hiu": "basic",
  "price_1Sxe5JRwAhX06SSd1xJqgQZg": "pro",
  "price_1Sxe5tRwAhX06SSdxzdFb1Bh": "elite",
};

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature) {
    logStep("ERROR: Missing Stripe signature");
    return new Response("Missing Stripe signature", { status: 400 });
  }

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    const body = await req.text();
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    logStep("Webhook event received", { type: event.type, id: event.id });

    // Initialize Supabase with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Helper function to find user by Stripe customer ID
    const findUserByCustomerId = async (customerId: string): Promise<{ userId: string; email: string } | null> => {
      // First try to find by stripe_customer_id in profiles
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profileData?.user_id) {
        return { userId: profileData.user_id, email: "" };
      }

      // Fallback: get customer email from Stripe and find user
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted || !customer.email) return null;

      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const user = authData?.users?.find(u => u.email === customer.email);
      
      if (user) {
        // Update profile with stripe_customer_id for faster lookups
        await supabaseAdmin
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
        
        return { userId: user.id, email: customer.email };
      }

      return null;
    };

    // Helper function to record subscription event
    const recordSubscriptionEvent = async (
      userId: string | null,
      eventType: string,
      status: string,
      planKey: string | null,
      amount: number | null,
      rawEvent: unknown
    ) => {
      await supabaseAdmin.from("subscription_events").insert({
        user_id: userId,
        provider: "stripe",
        event_type: eventType,
        status: status,
        plan_key: planKey,
        amount: amount,
        currency: "BRL",
        raw_event: rawEvent,
        external_id: event.id
      });
    };

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        if (session.mode === "subscription") {
          const userId = session.metadata?.user_id;
          const planKey = session.metadata?.plan_key;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (userId && subscriptionId) {
            // Get subscription details to find the price
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            const dbPlan = PRICE_TO_PLAN[priceId] || "free";

            await supabaseAdmin
              .from("profiles")
              .update({
                current_plan: dbPlan,
                plan_status: "active",
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);

            logStep("Profile updated after checkout", { userId, dbPlan, subscriptionId });

            await recordSubscriptionEvent(
              userId,
              "checkout.session.completed",
              "active",
              planKey || PRICE_TO_PLAN_KEY[priceId],
              session.amount_total,
              event.data.object
            );
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const dbPlan = PRICE_TO_PLAN[priceId] || "free";
        const planKey = PRICE_TO_PLAN_KEY[priceId] || "free";

        logStep(`Processing ${event.type}`, { subscriptionId: subscription.id, status: subscription.status, priceId });

        const userInfo = await findUserByCustomerId(customerId);
        
        if (userInfo) {
          const updateData: Record<string, unknown> = {
            current_plan: dbPlan,
            plan_status: subscription.status,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          };

          // Set expiration based on status
          if (subscription.status === "active" || subscription.status === "trialing") {
            updateData.plan_expires_at = new Date(subscription.current_period_end * 1000).toISOString();
          } else if (subscription.cancel_at_period_end) {
            updateData.plan_expires_at = new Date(subscription.current_period_end * 1000).toISOString();
          }

          await supabaseAdmin
            .from("profiles")
            .update(updateData)
            .eq("user_id", userInfo.userId);

          logStep("Profile updated", { userId: userInfo.userId, dbPlan, status: subscription.status });

          await recordSubscriptionEvent(
            userInfo.userId,
            event.type,
            subscription.status,
            planKey,
            null,
            event.data.object
          );
        } else {
          logStep("WARN: User not found for customer", { customerId });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logStep("Processing subscription deleted", { subscriptionId: subscription.id });

        const userInfo = await findUserByCustomerId(customerId);

        if (userInfo) {
          // Check if subscription ended or was cancelled at period end
          const now = Date.now() / 1000;
          const periodEnd = subscription.current_period_end;

          if (periodEnd > now) {
            // Still has access until period end
            await supabaseAdmin
              .from("profiles")
              .update({
                plan_status: "canceled",
                plan_expires_at: new Date(periodEnd * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userInfo.userId);

            logStep("Subscription cancelled, access until period end", { userId: userInfo.userId, periodEnd: new Date(periodEnd * 1000).toISOString() });
          } else {
            // Period already ended, downgrade to free
            await supabaseAdmin
              .from("profiles")
              .update({
                current_plan: "free",
                plan_status: "expired",
                stripe_subscription_id: null,
                plan_expires_at: null,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userInfo.userId);

            logStep("Subscription expired, downgraded to free", { userId: userInfo.userId });
          }

          await recordSubscriptionEvent(
            userInfo.userId,
            "customer.subscription.deleted",
            "canceled",
            null,
            null,
            event.data.object
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        logStep("Processing payment succeeded", { invoiceId: invoice.id, subscriptionId });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const dbPlan = PRICE_TO_PLAN[priceId] || "free";

          const userInfo = await findUserByCustomerId(customerId);

          if (userInfo) {
            await supabaseAdmin
              .from("profiles")
              .update({
                current_plan: dbPlan,
                plan_status: "active",
                plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userInfo.userId);

            logStep("Profile updated after payment", { userId: userInfo.userId, dbPlan });

            await recordSubscriptionEvent(
              userInfo.userId,
              "invoice.payment_succeeded",
              "active",
              PRICE_TO_PLAN_KEY[priceId],
              invoice.amount_paid,
              event.data.object
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        logStep("Processing payment failed", { invoiceId: invoice.id });

        const userInfo = await findUserByCustomerId(customerId);

        if (userInfo) {
          await supabaseAdmin
            .from("profiles")
            .update({
              plan_status: "past_due",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userInfo.userId);

          logStep("Profile marked as past_due", { userId: userInfo.userId });

          await recordSubscriptionEvent(
            userInfo.userId,
            "invoice.payment_failed",
            "past_due",
            null,
            invoice.amount_due,
            event.data.object
          );
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
