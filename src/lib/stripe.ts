import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Throws a clear error instead of a cryptic Stripe SDK failure when the operator hasn't
// set up their own Stripe account yet — see README "Billing setup".
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured on this deployment (STRIPE_SECRET_KEY is unset).");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-07-29.dahlia" });
  }
  return cached;
}

export const PRICE_TO_PLAN: Record<string, "PRO" | "TEAM"> = Object.fromEntries(
  [
    [process.env.STRIPE_PRICE_ID_PRO, "PRO"],
    [process.env.STRIPE_PRICE_ID_TEAM, "TEAM"],
  ].filter(([priceId]) => Boolean(priceId)) as [string, "PRO" | "TEAM"][]
);
