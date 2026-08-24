import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-fade">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center md:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-400" />
          Non-custodial — we never hold your funds
        </div>

        <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
          Real market data.
          <br />
          <span className="text-signal-400">Honest</span> trading signals.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-slate-400 md:text-lg">
          Connect a read-only key from your exchange and see your real portfolio, live prices,
          and technical indicators computed from actual market history — all in one dashboard.
          No guaranteed returns. No fund custody. No fabricated stats.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="w-full rounded-lg bg-signal-500 px-6 py-3 text-sm font-medium text-ink-950 transition hover:bg-signal-400 sm:w-auto"
          >
            Create a free account
          </Link>
          <a
            href="#security"
            className="w-full rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 sm:w-auto"
          >
            How your keys stay safe
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:grid-cols-3">
          {[
            { label: "Exchanges integrated", value: "6" },
            { label: "Indicator families", value: "RSI · EMA · MACD" },
            { label: "Your funds held by us", value: "$0, always" },
          ].map((stat) => (
            <div key={stat.label} className="bg-ink-950/60 px-6 py-5 text-center">
              <div className="font-display text-xl font-semibold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
