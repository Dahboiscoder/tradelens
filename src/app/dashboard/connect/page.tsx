"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_EXCHANGES } from "@/lib/exchangeList";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50";

export default function ConnectExchangePage() {
  const router = useRouter();
  const [exchange, setExchange] = useState<string>(SUPPORTED_EXCHANGES[0].id);
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/exchanges/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange, label, apiKey, apiSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not connect");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-white">Connect an exchange</h1>
      <p className="mt-1 text-sm text-slate-400">
        Use a read-only (or trade-only) API key. Never enable withdrawal access — this app never
        needs or uses it.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-white/10 bg-ink-900/60 p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Exchange</label>
          <select value={exchange} onChange={(e) => setExchange(e.target.value)} className={inputClass}>
            {SUPPORTED_EXCHANGES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Main Binance account"
            className={inputClass}
            required
            maxLength={60}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">API key</label>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={`${inputClass} font-mono`}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">API secret</label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className={`${inputClass} font-mono`}
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
        >
          {loading ? "Verifying & connecting…" : "Connect exchange"}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Before you connect:</strong> create an API key on your
        exchange with read/trade permissions only, and confirm withdrawal access is disabled. Your
        key and secret are encrypted before storage and are never sent anywhere except the
        exchange's own API.
      </div>
    </div>
  );
}
