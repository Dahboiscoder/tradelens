"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#plans", label: "Plans" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400">
            ◈
          </span>
          TradeLens
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-slate-400 transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-slate-300 transition hover:text-white">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-400"
          >
            Get started
          </Link>
        </div>

        <button
          className="text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-slate-300" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-white/5 pt-4">
              <Link href="/login" className="text-sm text-slate-300">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-signal-500 px-4 py-2 text-center text-sm font-medium text-ink-950"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
