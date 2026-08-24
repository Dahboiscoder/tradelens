const FEATURES = [
  {
    title: "Live market data",
    body:
      "Prices, order book snapshots, and candle history pulled directly from each exchange's public API — the same data the exchange itself shows.",
    icon: "◐",
  },
  {
    title: "Real technical indicators",
    body:
      "RSI, EMA, SMA, and MACD computed from actual price history, not a black box. Every signal shows the numbers and the plain-English reasoning behind it.",
    icon: "∿",
  },
  {
    title: "Your real portfolio",
    body:
      "Connect a read-only API key and see your actual holdings across exchanges in one view. We only ever call balance-read endpoints — never trade or withdrawal endpoints.",
    icon: "◫",
  },
  {
    title: "Non-custodial by design",
    body:
      "We never ask for or need withdrawal access, and we never take custody of your funds. Your money stays on the exchange, under your control, at all times.",
    icon: "◈",
  },
  {
    title: "Keys encrypted at rest",
    body:
      "API credentials are encrypted with AES-256-GCM before they touch the database. There is no code path in this app that can withdraw or transfer funds.",
    icon: "◆",
  },
  {
    title: "Multi-exchange watchlists",
    body:
      "Track pairs across Binance, Coinbase, Kraken, OKX, Bybit, and KuCoin side by side, with signals refreshed on a schedule that fits your plan.",
    icon: "◒",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          What TradeLens actually does
        </h2>
        <p className="mt-4 text-slate-400">
          No AI black box, no promised returns — just your real portfolio and transparent,
          explainable market analysis in one place.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-white/10 bg-ink-900/60 p-6 transition hover:border-signal-500/30 hover:bg-ink-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-500/10 text-lg text-signal-400">
              {feature.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
