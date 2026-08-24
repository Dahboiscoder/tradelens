import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, isBillingConfigured, PRICE_TO_PLAN } from "@/lib/stripe";

async function syncSubscriptionToUser(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const priceId = subscription.items.data[0]?.price.id;
  const mappedPlan = priceId ? PRICE_TO_PLAN[priceId] : undefined;
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      // Falls back to FREE for any non-active status or unrecognized price — a canceled
      // or past-due subscription should never leave a user stuck on a paid plan.
      plan: isActive && mappedPlan ? mappedPlan : "FREE",
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isBillingConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing webhook not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscriptionToUser(subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionToUser(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
