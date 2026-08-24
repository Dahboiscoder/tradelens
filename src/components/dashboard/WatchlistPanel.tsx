"use client";

import { useEffect, useState } from "react";
import { SUPPORTED_EXCHANGES } from "@/lib/exchangeList";
import { TradeModal } from "./TradeModal";

interface WatchlistItem {
  id: string;
  exchange: string;
  symbol: string;
}

interface MarketRow {
  loading: boolean;
  error?: string;
  ticker?: { last: number | null; changePercent: number | null };
  signal?: { label: string; rsi: number | null; explanation: string };
}

const inputClass =
  "rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-slate-100 focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50";

export function WatchlistPanel() {
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [rows, setRows] = useState<Record<string, MarketRow>>({});
  const [exchange, setExchange] = useState<string>(SUPPORTED_EXCHANGES[0].id);
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<WatchlistItem | null>(null);

  async function loadItems() {
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (!items) return;
    items.forEach((item) => {
      setRows((prev) => ({ ...prev, [item.id]: { loading: true } }));
      const symbolParam = encodeURIComponent(item.symbol);
      Promise.all([
        fetch(`/api/market/ticker/${item.exchange}?symbol=${symbolParam}`).then((r) => r.json()),
        fetch(`/api/market/signals/${item.exchange}?symbol=${symbolParam}`).then((r) => r.json()),
      ])
        .then(([ticker, signalRes]) => {
          setRows((prev) => ({
            ...prev,
            [item.id]: {
              loading: false,
              ticker: ticker.error ? undefined : ticker,
              signal: signalRes.error ? undefined : signalRes.signal,
              error: ticker.error || signalRes.error,
            },
          }));
        })
        .catch(() =>
          setRows((prev) => ({
            ...prev,
            [item.id]: { loading: false, error: "Failed to load market data" },
          }))
        );
    });
  }, [items]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange, symbol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Could not add pair");
        return;
      }
      setSymbol("");
      await loadItems();
    } finally {
      setAdding(false);
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    await loadItems();
  }

  return (
    <div>
      <form
        onSubmit={addItem}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-ink-900/60 p-4"
      >
        <div>
          <label className="mb-1 block text-xs text-slate-400">Exchange</label>
          <select value={exchange} onChange={(e) => setExchange(e.target.value)} className={inputClass}>
            {SUPPORTED_EXCHANGES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Pair</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTC/USDT"
            className={`${inputClass} font-mono`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add to watchlist"}
        </button>
      </form>
      {addError && <p className="mt-2 text-sm text-red-400">{addError}</p>}

      <div className="mt-6 space-y-3">
        {items === null && <p className="text-sm text-slate-500">Loading watchlist…</p>}
        {items?.length === 0 && <p className="text-sm text-slate-500">No pairs yet — add one above.</p>}
        {items?.map((item) => {
          const row = rows[item.id];
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-ink-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-white">{item.symbol}</p>
                  <p className="text-xs text-slate-500">{item.exchange}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTradeTarget(item)}
                    className="rounded-lg border border-signal-500/30 px-3 py-1 text-xs font-medium text-signal-400 hover:border-signal-500/50"
                  >
                    Trade
                  </button>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-slate-500 hover:text-red-400">
                    Remove
                  </button>
                </div>
              </div>

              {row?.loading && <p className="mt-3 text-xs text-slate-500">Loading market data…</p>}
              {row?.error && <p className="mt-3 text-xs text-red-400">{row.error}</p>}

              {row?.ticker && (
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="font-mono text-white">{row.ticker.last}</span>
                  {row.ticker.changePercent !== null && row.ticker.changePercent !== undefined && (
                    <span className={row.ticker.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {row.ticker.changePercent >= 0 ? "+" : ""}
                      {row.ticker.changePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              )}

              {row?.signal && (
                <div className="mt-3 rounded-lg bg-white/5 p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      row.signal.label === "bullish-lean"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : row.signal.label === "bearish-lean"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {row.signal.label.replace("-", " ")}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{row.signal.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tradeTarget && (
        <TradeModal
          exchange={tradeTarget.exchange}
          symbol={tradeTarget.symbol}
          onClose={() => setTradeTarget(null)}
        />
      )}
    </div>
  );
}
