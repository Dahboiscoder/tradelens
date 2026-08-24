"use client";

import { useEffect, useState } from "react";
import { SUPPORTED_EXCHANGES } from "@/lib/exchangeList";

interface Connection {
  id: string;
  exchange: string;
  label: string;
  createdAt: string;
}

function exchangeName(id: string) {
  return SUPPORTED_EXCHANGES.find((e) => e.id === id)?.name ?? id;
}

export default function SettingsPage() {
  const [connections, setConnections] = useState<Connection[] | null>(null);

  async function load() {
    const res = await fetch("/api/exchanges/connections");
    const data = await res.json();
    setConnections(data.connections ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Disconnect this exchange? Stored credentials will be deleted immediately.")) return;
    await fetch(`/api/exchanges/connections/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>

      <section className="mt-8">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          Connected exchanges
        </h2>
        {connections === null && <p className="text-sm text-slate-500">Loading…</p>}
        {connections?.length === 0 && <p className="text-sm text-slate-500">No exchanges connected.</p>}
        <div className="space-y-3">
          {connections?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 p-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{c.label}</p>
                <p className="text-xs text-slate-500">
                  {exchangeName(c.exchange)} · connected {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => remove(c.id)} className="text-xs text-slate-500 hover:text-red-400">
                Disconnect
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-white/10 bg-ink-900/60 p-5 text-xs leading-relaxed text-slate-500">
        Disconnecting an exchange permanently deletes its encrypted API credentials from our
        database. There is no backup or export — reconnecting requires entering a key again.
      </section>
    </div>
  );
}
