export function About() {
  return (
    <section id="about" className="border-t border-white/5 bg-ink-900/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            What TradeLens is — and isn't
          </h2>
          <div className="mt-6 space-y-4 text-slate-400">
            <p>
              TradeLens is a market-data and portfolio-tracking dashboard. It connects to exchanges
              you already use via read-only API keys and shows you real prices, real technical
              indicators, and your real holdings in one place.
            </p>
            <p>
              It is <strong className="text-slate-200">not</strong> a licensed broker, investment
              adviser, or fund manager. It does not take custody of your money, execute trades on
              your behalf by default, or promise any rate of return. Technical indicators shown
              here summarize past price action — they are not predictions and not financial advice.
            </p>
            <p>
              We built it because most "AI trading" sites promise guaranteed profits and hide how
              anything actually works. This one shows its math.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-950 p-8">
          <h3 className="font-display text-sm font-medium uppercase tracking-wide text-signal-400">
            In plain terms
          </h3>
          <dl className="mt-6 space-y-5">
            {[
              ["Custody", "None. Your funds never leave your exchange account."],
              ["API access requested", "Read balances + trade only — never withdrawals."],
              ["Returns promised", "None. There is no investment product here."],
              ["Indicators", "Standard, published formulas (RSI, EMA, MACD) — no proprietary claims."],
            ].map(([term, desc]) => (
              <div key={term} className="flex flex-col gap-1 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{term}</dt>
                <dd className="text-sm text-slate-200">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
