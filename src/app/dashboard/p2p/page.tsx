"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { P2PSafetyBanner } from "@/components/dashboard/P2PSafetyBanner";

interface Offer {
  id: string;
  side: "BUY" | "SELL";
  asset: string;
  amount: number;
  fiatCurrency: string;
  pricePerUnit: number;
  paymentMethod: string;
  createdAt: string;
  user: { id: string; name: string };
}

export default function P2PBoardPage() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [asset, setAsset] = useState("");

  async function load() {
    const qs = asset ? `?asset=${encodeURIComponent(asset)}` : "";
    const res = await fetch(`/api/p2p/offers${qs}`);
    const data = await res.json();
    setOffers(data.offers ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">P2P offers</h1>
          <p className="mt-1 text-sm text-slate-400">Trade directly with other TradeLens users.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/p2p/threads"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
          >
            My conversations
          </Link>
          <Link
            href="/dashboard/p2p/new"
            className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-signal-400"
          >
            Post an offer
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <P2PSafetyBanner />
      </div>

      <div className="mt-6">
        <input
          value={asset}
          onChange={(e) => setAsset(e.target.value.toUpperCase())}
          placeholder="Filter by asset, e.g. BTC"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-slate-100 font-mono focus:border-signal-500/50 focus:outline-none focus:ring-1 focus:ring-signal-500/50"
        />
      </div>

      <div className="mt-6 space-y-3">
        {offers === null && <p className="text-sm text-slate-500">Loading offers…</p>}
        {offers?.length === 0 && <p className="text-sm text-slate-500">No open offers right now.</p>}
        {offers?.map((offer) => (
          <Link
            key={offer.id}
            href={`/dashboard/p2p/${offer.id}`}
            className="block rounded-xl border border-white/10 bg-ink-900/60 p-5 transition hover:border-signal-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    offer.side === "SELL"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {offer.side === "SELL" ? "Selling" : "Buying"}
                </span>
                <span className="font-mono text-sm font-medium text-white">
                  {offer.amount} {offer.asset}
                </span>
              </div>
              <span className="font-mono text-sm text-slate-300">
                {offer.pricePerUnit} {offer.fiatCurrency}/unit
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{offer.paymentMethod}</span>
              <span>posted by {offer.user.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
