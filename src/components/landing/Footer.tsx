export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} TradeLens. Not a licensed broker or investment adviser.</p>
        <p>Market data via public exchange APIs. Indicators are informational only, not financial advice.</p>
      </div>
    </footer>
  );
}
