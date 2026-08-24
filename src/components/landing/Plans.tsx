import Link from "next/link";
import { PLANS } from "@/lib/plans";

export function Plans() {
  return (
    <section id="plans" className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Plans, not investment tiers
          </h2>
          <p className="mt-4 text-slate-400">
            You're paying for software access, not buying into a return. Every plan includes the
            same signals and the same non-custodial security model — only the number of exchange
            connections and watchlist pairs changes.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.id === "PRO"
                  ? "border-signal-500/40 bg-signal-500/[0.04]"
                  : "border-white/10 bg-ink-900/60"
              }`}
            >
              {plan.id === "PRO" && (
                <span className="mb-4 inline-block w-fit rounded-full bg-signal-500/15 px-3 py-1 text-xs font-medium text-signal-400">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-white">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-signal-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "TEAM" ? "#contact" : "/register"}
                className={`mt-8 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition ${
                  plan.id === "PRO"
                    ? "bg-signal-500 text-ink-950 hover:bg-signal-400"
                    : "border border-white/15 text-slate-200 hover:border-white/30"
                }`}
              >
                {plan.id === "TEAM" ? "Contact us" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">
          Create a free account first, then upgrade to Pro from Dashboard → Billing — checkout is
          handled by Stripe, we never see or store your card details.
        </p>
      </div>
    </section>
  );
}
