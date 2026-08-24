import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, isBillingConfigured } from "@/lib/stripe";

const schema = z.object({ plan: z.enum(["PRO", "TEAM"]) });

const PRICE_ENV: Record<"PRO" | "TEAM", string | undefined> = {
  PRO: process.env.STRIPE_PRICE_ID_PRO,
  TEAM: process.env.STRIPE_PRICE_ID_TEAM,
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isBillingConfigured()) {
    return NextResponse.json(
      {
        error:
          "Billing isn't configured on this deployment yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_* to enable it.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const priceId = PRICE_ENV[parsed.data.plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for the ${parsed.data.plan} plan` },
      { status: 501 }
    );
  }

  const stripe = getStripe();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
    metadata: { userId: dbUser.id },
    subscription_data: { metadata: { userId: dbUser.id } },
  });

  return NextResponse.json({ url: session.url });
}
