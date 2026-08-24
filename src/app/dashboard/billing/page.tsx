"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS } from "@/lib/plans";

interface Me {
  plan: "FREE" | "PRO" | "TEAM";
  stripeSubscriptionStatus: string | null;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const [me, setMe] = useState<Me | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMe(data.user));
  }, []);

  async function upgrade(plan: "PRO" | "TEAM") {
    setError(null);
    setLoadingAction(`upgrade-${plan}`);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoadingAction(null);
    }
  }

  async function manageBilling() {
    setError(null);
    setLoadingAction("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not open billing portal");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-white">Billing</h1>
      <p className="mt-1 text-sm text-slate-400">Manage your plan and payment details.</p>

      {checkoutResult === "success" && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          Subscription updated. It may take a few seconds to reflect below.
        </div>
      )}
      {checkoutResult === "cancelled" && (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
          Checkout was cancelled — no charge was made.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-white/10 bg-ink-900/60 p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">Current plan</p>
        <p className="mt-1 font-display text-2xl font-semibold text-white">{me?.plan ?? "…"}</p>
        {me?.stripeSubscriptionStatus && (
          <p className="mt-1 text-xs text-slate-500">Subscription status: {me.stripeSubscriptionStatus}</p>
        )}

        {me && me.plan !== "FREE" && (
          <button
            onClick={manageBilling}
            disabled={loadingAction === "portal"}
            className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 disabled:opacity-50"
          >
            {loadingAction === "portal" ? "Opening…" : "Manage billing"}
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-white/10 bg-ink-900/60 p-5">
            <p className="font-display text-lg font-medium text-white">{plan.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              {plan.price}
              {plan.period}
            </p>
            {me?.plan === plan.id ? (
              <span className="mt-4 inline-block rounded-full bg-signal-500/15 px-3 py-1 text-xs text-signal-400">
                Current plan
              </span>
            ) : plan.id === "FREE" ? null : plan.id === "TEAM" ? (
              <a
                href="mailto:hello@tradelens.example"
                className="mt-4 inline-block rounded-lg border border-white/15 px-4 py-2 text-xs text-slate-200 hover:border-white/30"
              >
                Contact us
              </a>
            ) : (
              <button
                onClick={() => upgrade("PRO")}
                disabled={loadingAction === "upgrade-PRO"}
                className="mt-4 w-full rounded-lg bg-signal-500 px-4 py-2 text-xs font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
              >
                {loadingAction === "upgrade-PRO" ? "Starting checkout…" : "Upgrade"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
