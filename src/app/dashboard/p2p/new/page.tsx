"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { P2PSafetyBanner } from "@/components/dashboard/P2PSafetyBanner";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50";

export default function NewP2POfferPage() {
  const router = useRouter();
  const [side, setSide] = useState<"BUY" | "SELL">("SELL");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/p2p/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          asset,
          amount: Number(amount),
          fiatCurrency,
          pricePerUnit: Number(pricePerUnit),
          paymentMethod,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not post offer");
        return;
      }
      router.push(`/dashboard/p2p/${data.offer.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-white">Post a P2P offer</h1>
      <p className="mt-1 text-sm text-slate-400">
        Visible to other TradeLens users on the offer board. You control when to mark it complete.
      </p>

      <div className="mt-6">
        <P2PSafetyBanner />
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-white/10 bg-ink-900/60 p-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              side === "SELL"
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            I'm selling
          </button>
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              side === "BUY"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            I'm buying
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Asset</label>
            <input value={asset} onChange={(e) => setAsset(e.target.value.toUpperCase())} className={`${inputClass} font-mono`} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="any" className={inputClass} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Fiat currency</label>
            <input value={fiatCurrency} onChange={(e) => setFiatCurrency(e.target.value.toUpperCase())} className={`${inputClass} font-mono`} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Price per unit</label>
            <input value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} type="number" min="0" step="any" className={inputClass} required />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Payment method</label>
          <input
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g. Bank transfer, PayPal, cash in person"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post offer"}
        </button>
      </form>
    </div>
  );
}
