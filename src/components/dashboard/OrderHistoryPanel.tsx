"use client";

import { useEffect, useState } from "react";

interface OrderRow {
  id: string;
  exchange: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  amount: number;
  price: number | null;
  status: "PENDING" | "FILLED" | "FAILED";
  errorMessage: string | null;
  createdAt: string;
}

function statusClass(status: OrderRow["status"]) {
  if (status === "FILLED") return "bg-emerald-500/15 text-emerald-400";
  if (status === "FAILED") return "bg-red-500/15 text-red-400";
  return "bg-amber-500/15 text-amber-400";
}

export function OrderHistoryPanel() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []));
  }, []);

  if (orders === null) return <p className="text-sm text-slate-500">Loading order history…</p>;
  if (orders.length === 0) {
    return <p className="text-sm text-slate-500">No orders placed yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Pair</th>
            <th className="px-4 py-3">Side</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3 font-mono text-slate-200">{o.symbol}</td>
              <td className={`px-4 py-3 ${o.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                {o.side}
              </td>
              <td className="px-4 py-3 text-slate-400">{o.type}</td>
              <td className="px-4 py-3 font-mono text-slate-300">{o.amount}</td>
              <td className="px-4 py-3 font-mono text-slate-300">{o.price ?? "market"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass(o.status)}`}>
                  {o.status.toLowerCase()}
                </span>
                {o.status === "FAILED" && o.errorMessage && (
                  <p className="mt-1 max-w-xs text-xs text-red-400/70">{o.errorMessage}</p>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(o.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
