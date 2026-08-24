"use client";

import { useState } from "react";

const FAQS: Array<[string, string]> = [
  [
    "Do you hold my crypto or cash?",
    "No. TradeLens is non-custodial — your funds stay on your exchange account at all times. We only read balances and market data through the exchange's API.",
  ],
  [
    "What permissions does my API key need?",
    "Read and trade permissions if you want to place orders from the dashboard in the future; read-only is enough for balances and signals today. Never enable withdrawal permissions for a key you connect here — TradeLens has no feature that uses it.",
  ],
  [
    "Are the trading signals guaranteed to be right?",
    "No signal or indicator can predict the market. RSI, EMA, and MACD are standard technical-analysis formulas applied to real historical data — they describe past price action, not future returns. Nothing on this site is financial advice.",
  ],
  [
    "Is TradeLens a licensed broker or investment adviser?",
    "No. TradeLens does not execute trades on your behalf, manage funds, or offer investment advice. It's a data and analytics dashboard on top of exchanges you already have accounts with.",
  ],
  [
    "How do I disconnect an exchange?",
    "Go to Dashboard → Settings → Connected Exchanges and remove the connection. The encrypted credentials are deleted from our database immediately.",
  ],
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-center font-display text-3xl font-semibold text-white sm:text-4xl">
        Frequently asked questions
      </h2>

      <div className="mt-12 divide-y divide-white/10 rounded-xl border border-white/10">
        {FAQS.map(([q, a], i) => {
          const isOpen = openIndex === i;
          return (
            <div key={q}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span className="font-medium text-slate-100">{q}</span>
                <span className={`shrink-0 text-signal-400 transition-transform ${isOpen ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              {isOpen && <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
