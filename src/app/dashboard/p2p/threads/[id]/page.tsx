"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { P2PSafetyBanner } from "@/components/dashboard/P2PSafetyBanner";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface ThreadInfo {
  id: string;
  offer: { id: string; side: "BUY" | "SELL"; asset: string; amount: number; fiatCurrency: string; pricePerUnit: number };
  owner: { id: string; name: string };
  counterparty: { id: string; name: string };
}

export default function P2PThreadPage() {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/p2p/threads/${id}/messages`);
    const data = await res.json();
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    fetch(`/api/p2p/threads/${id}`)
      .then((r) => r.json())
      .then((data) => setThread(data.thread));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMeId(data.user?.id ?? null));
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/p2p/threads/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (res.ok) {
        setDraft("");
        await loadMessages();
      }
    } finally {
      setSending(false);
    }
  }

  if (!thread) return <p className="text-sm text-slate-500">Loading conversation…</p>;

  const otherParty = meId === thread.owner.id ? thread.counterparty : thread.owner;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">{otherParty.name}</h1>
          <Link href={`/dashboard/p2p/${thread.offer.id}`} className="text-xs text-slate-500 hover:text-slate-300">
            {thread.offer.side === "SELL" ? "Selling" : "Buying"} {thread.offer.amount} {thread.offer.asset} @{" "}
            {thread.offer.pricePerUnit} {thread.offer.fiatCurrency}
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <P2PSafetyBanner />
      </div>

      <div className="mt-4 flex h-96 flex-col rounded-xl border border-white/10 bg-ink-900/60">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages === null && <p className="text-sm text-slate-500">Loading messages…</p>}
          {messages?.length === 0 && <p className="text-sm text-slate-500">No messages yet — say hello.</p>}
          {messages?.map((m) => {
            const mine = m.sender.id === meId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    mine ? "bg-signal-500 text-ink-950" : "bg-white/10 text-slate-200"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-slate-100 focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
