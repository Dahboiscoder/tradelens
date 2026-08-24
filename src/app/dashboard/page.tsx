import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { WatchlistPanel } from "@/components/dashboard/WatchlistPanel";
import { OrderHistoryPanel } from "@/components/dashboard/OrderHistoryPanel";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-white">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">
        Your real holdings and live market signals — nothing here is simulated.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Portfolio</h2>
        <PortfolioPanel />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          Watchlist &amp; signals
        </h2>
        <WatchlistPanel />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          Recent orders
        </h2>
        <OrderHistoryPanel />
      </section>

      <p className="mt-10 max-w-2xl text-xs text-slate-600">
        Signals are computed from real historical price data using standard technical-analysis
        formulas (RSI, EMA, MACD). They describe past price action, not predictions, and are not
        financial advice. Every order above was placed manually and confirmed by you — TradeLens
        never trades on your behalf automatically.
      </p>
    </div>
  );
}
