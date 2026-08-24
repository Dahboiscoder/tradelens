"use client";

import { useEffect, useState } from "react";

interface Connection {
  id: string;
  exchange: string;
  label: string;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-slate-100 focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50";

function sideButtonClass(active: boolean, kind: "buy" | "sell") {
  const base = "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition";
  if (!active) return `${base} border-white/10 text-slate-400 hover:border-white/20`;
  return kind === "buy"
    ? `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-400`
    : `${base} border-red-500/40 bg-red-500/10 text-red-400`;
}

export function TradeModal({
  exchange,
  symbol,
  onClose,
}: {
  exchange: string;
  symbol: string;
  onClose: () => void;
}) {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [connectionId, setConnectionId] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [type, setType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [step, setStep] = useState<"form" | "review" | "result">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; exchangeOrderId: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/exchanges/connections")
      .then((r) => r.json())
      .then((data: { connections?: Connection[] }) => {
        const matches = (data.connections ?? []).filter((c) => c.exchange === exchange);
        setConnections(matches);
        if (matches[0]) setConnectionId(matches[0].id);
      });
  }, [exchange]);

  const selectedConnection = connections?.find((c) => c.id === connectionId);
  const [base, quote] = symbol.split("/");

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchanges/connections/${connectionId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          type,
          amount: Number(amount),
          price: type === "LIMIT" ? Number(price) : undefined,
          confirm: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order failed");
        return;
      }
      setResult({ status: data.order.status, exchangeOrderId: data.order.exchangeOrderId });
      setStep("result");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">Trade {symbol}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        {connections === null && <p className="mt-4 text-sm text-slate-500">Loading connections…</p>}

        {connections?.length === 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-400">
            No {exchange} connection found. Connect this exchange first to trade {symbol}.
          </div>
        )}

        {connections && connections.length > 0 && step === "form" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Connection</label>
              <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)} className={inputClass}>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSide("BUY")} className={sideButtonClass(side === "BUY", "buy")}>
                Buy
              </button>
              <button onClick={() => setSide("SELL")} className={sideButtonClass(side === "SELL", "sell")}>
                Sell
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Order type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "MARKET" | "LIMIT")}
                className={inputClass}
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Amount ({base})</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="any"
                className={inputClass}
                required
              />
            </div>

            {type === "LIMIT" && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">Limit price ({quote})</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="any"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <button
              disabled={!amount || Number(amount) <= 0 || (type === "LIMIT" && (!price || Number(price) <= 0))}
              onClick={() => setStep("review")}
              className="w-full rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
            >
              Review order
            </button>
          </div>
        )}

        {step === "review" && selectedConnection && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm text-amber-100">
              <p>
                <strong>{side === "BUY" ? "Buy" : "Sell"}</strong> {amount} {symbol} at{" "}
                {type === "MARKET" ? "market price" : `${price} ${quote} (limit)`} on{" "}
                <strong>{selectedConnection.label}</strong>.
              </p>
              <p className="mt-2 text-xs text-amber-200/70">
                This places a real order on the exchange. TradeLens cannot cancel or reverse it once
                submitted — manage open orders directly on the exchange if needed.
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/30"
              >
                Back
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
              >
                {submitting ? "Placing order…" : "Confirm & place order"}
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-emerald-400">
              Order submitted — status: {result.status.toLowerCase()}.
            </p>
            {result.exchangeOrderId && (
              <p className="text-xs text-slate-500">Exchange order ID: {result.exchangeOrderId}</p>
            )}
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/30"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
