import { SUPPORTED_EXCHANGES } from "@/lib/exchangeList";

export function SupportedExchanges() {
  return (
    <section className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-slate-500">
          Real integrations via ccxt — not decorative logos
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {SUPPORTED_EXCHANGES.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] py-4 text-sm font-medium text-slate-300"
            >
              {ex.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
