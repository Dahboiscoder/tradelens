import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, isBillingConfigured } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isBillingConfigured()) {
    return NextResponse.json({ error: "Billing isn't configured on this deployment yet." }, { status: 501 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found for this user yet" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
