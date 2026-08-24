"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SUPPORTED_EXCHANGES } from "@/lib/exchangeList";

interface Connection {
  id: string;
  exchange: string;
  label: string;
  createdAt: string;
}

interface Holding {
  asset: string;
  amount: number;
}

interface BalanceState {
  holdings: Holding[];
  loading: boolean;
  error?: string;
}

function exchangeName(id: string) {
  return SUPPORTED_EXCHANGES.find((e) => e.id === id)?.name ?? id;
}

export function PortfolioPanel() {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [balances, setBalances] = useState<Record<string, BalanceState>>({});

  useEffect(() => {
    fetch("/api/exchanges/connections")
      .then((r) => r.json())
      .then((data) => setConnections(data.connections ?? []));
  }, []);

  useEffect(() => {
    if (!connections) return;
    connections.forEach((c) => {
      setBalances((prev) => ({ ...prev, [c.id]: { holdings: [], loading: true } }));
      fetch(`/api/exchanges/connections/${c.id}/balance`)
        .then((r) => r.json())
        .then((data) => {
          setBalances((prev) => ({
            ...prev,
            [c.id]: { holdings: data.holdings ?? [], error: data.error, loading: false },
          }));
        })
        .catch(() =>
          setBalances((prev) => ({
            ...prev,
            [c.id]: { holdings: [], error: "Failed to load balance", loading: false },
          }))
        );
    });
  }, [connections]);

  if (connections === null) {
    return <div className="text-sm text-slate-500">Loading your portfolio…</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
        <p className="text-sm text-slate-400">No exchanges connected yet.</p>
        <Link
          href="/dashboard/connect"
          className="mt-4 inline-block rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-400"
        >
          Connect an exchange
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {connections.map((c) => {
        const b = balances[c.id];
        return (
          <div key={c.id} className="rounded-xl border border-white/10 bg-ink-900/60 p-5">
            <p className="font-medium text-white">{c.label}</p>
            <p className="text-xs text-slate-500">{exchangeName(c.exchange)}</p>

            <div className="mt-4 space-y-2">
              {b?.loading && <p className="text-xs text-slate-500">Fetching live balance…</p>}
              {b?.error && <p className="text-xs text-red-400">{b.error}</p>}
              {!b?.loading && !b?.error && b?.holdings.length === 0 && (
                <p className="text-xs text-slate-500">No non-zero balances found.</p>
              )}
              {b?.holdings.map((h) => (
                <div key={h.asset} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{h.asset}</span>
                  <span className="font-mono text-slate-200">{h.amount}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
