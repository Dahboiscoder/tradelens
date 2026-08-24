const POINTS = [
  {
    title: "Read-only keys, always",
    body:
      "When you connect an exchange, create an API key with trading/read permissions only and leave withdrawal access disabled. TradeLens never asks for it and has no feature that would use it.",
  },
  {
    title: "Encrypted at rest",
    body:
      "API keys and secrets are encrypted with AES-256-GCM before being stored, using a server-side key that never reaches the browser.",
  },
  {
    title: "You can disconnect anytime",
    body:
      "Removing a connection deletes the stored credentials immediately. There's no export, no backup copy, no way for us to recover them after deletion.",
  },
  {
    title: "No custody, ever",
    body:
      "We never touch your funds. All balances are read directly from your exchange in real time — nothing is held, pooled, or routed through TradeLens.",
  },
];

export function Security() {
  return (
    <section id="security" className="border-t border-white/5 bg-ink-900/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            How your keys stay safe
          </h2>
          <p className="mt-4 text-slate-400">
            This is the part most trading sites skip. Here's exactly what happens to your
            credentials.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-xl border border-white/10 bg-ink-950 p-6">
              <h3 className="font-display text-base font-medium text-white">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
