"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { P2PSafetyBanner } from "@/components/dashboard/P2PSafetyBanner";

interface Offer {
  id: string;
  side: "BUY" | "SELL";
  asset: string;
  amount: number;
  fiatCurrency: string;
  pricePerUnit: number;
  paymentMethod: string;
  notes: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: { id: string; name: string };
}

export default function P2POfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/p2p/offers/${id}`)
      .then((r) => r.json())
      .then((data) => setOffer(data.offer));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMeId(data.user?.id ?? null));
  }, [id]);

  async function contactPoster() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/p2p/offers/${id}/threads`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start conversation");
        return;
      }
      router.push(`/dashboard/p2p/threads/${data.thread.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(status: "COMPLETED" | "CANCELLED") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/p2p/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update offer");
        return;
      }
      setOffer((prev) => (prev ? { ...prev, status } : prev));
    } finally {
      setBusy(false);
    }
  }

  if (!offer) return <p className="text-sm text-slate-500">Loading offer…</p>;

  const isOwner = meId === offer.user.id;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            offer.side === "SELL" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {offer.side === "SELL" ? "Selling" : "Buying"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            offer.status === "OPEN"
              ? "bg-white/10 text-slate-300"
              : offer.status === "COMPLETED"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-white/5 text-slate-500"
          }`}
        >
          {offer.status.toLowerCase()}
        </span>
      </div>

      <h1 className="mt-3 font-display text-2xl font-semibold text-white">
        {offer.amount} {offer.asset} at {offer.pricePerUnit} {offer.fiatCurrency}/unit
      </h1>
      <p className="mt-1 text-sm text-slate-400">Posted by {offer.user.name}</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-ink-900/60 p-5 text-sm text-slate-300">
        <p>
          <span className="text-slate-500">Payment method:</span> {offer.paymentMethod}
        </p>
        {offer.notes && (
          <p className="mt-2">
            <span className="text-slate-500">Notes:</span> {offer.notes}
          </p>
        )}
      </div>

      <div className="mt-6">
        <P2PSafetyBanner />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex gap-3">
        {!isOwner && offer.status === "OPEN" && (
          <button
            onClick={contactPoster}
            disabled={busy}
            className="rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
          >
            {busy ? "Opening…" : "Contact poster"}
          </button>
        )}
        {isOwner && offer.status === "OPEN" && (
          <>
            <button
              onClick={() => updateStatus("COMPLETED")}
              disabled={busy}
              className="rounded-lg border border-emerald-500/40 px-4 py-2.5 text-sm text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
            >
              Mark as completed
            </button>
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={busy}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/30 disabled:opacity-50"
            >
              Cancel offer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
