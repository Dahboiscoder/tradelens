"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ThreadRow {
  id: string;
  offer: { id: string; side: "BUY" | "SELL"; asset: string; amount: number; fiatCurrency: string; pricePerUnit: number };
  owner: { id: string; name: string };
  counterparty: { id: string; name: string };
  messages: { body: string; createdAt: string }[];
}

export default function P2PThreadsPage() {
  const [threads, setThreads] = useState<ThreadRow[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/p2p/threads")
      .then((r) => r.json())
      .then((data) => setThreads(data.threads ?? []));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMeId(data.user?.id ?? null));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-white">My conversations</h1>
      <p className="mt-1 text-sm text-slate-400">P2P negotiations you're part of.</p>

      <div className="mt-6 space-y-3">
        {threads === null && <p className="text-sm text-slate-500">Loading…</p>}
        {threads?.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
        {threads?.map((t) => {
          const otherParty = meId === t.owner.id ? t.counterparty : t.owner;
          const lastMessage = t.messages[0];
          return (
            <Link
              key={t.id}
              href={`/dashboard/p2p/threads/${t.id}`}
              className="block rounded-xl border border-white/10 bg-ink-900/60 p-5 transition hover:border-signal-500/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{otherParty.name}</p>
                <span className="font-mono text-xs text-slate-500">
                  {t.offer.amount} {t.offer.asset} @ {t.offer.pricePerUnit} {t.offer.fiatCurrency}
                </span>
              </div>
              {lastMessage && (
                <p className="mt-2 truncate text-xs text-slate-500">{lastMessage.body}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
