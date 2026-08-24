"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: "◫" },
  { href: "/dashboard/connect", label: "Connect exchange", icon: "◈" },
  { href: "/dashboard/p2p", label: "P2P", icon: "⇄" },
  { href: "/dashboard/billing", label: "Billing", icon: "◆" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

interface SidebarUser {
  name: string;
  email: string;
  plan: string;
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900/40 px-6 py-8 md:flex">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400">
            ◈
          </span>
          TradeLens
        </Link>

        <nav className="mt-10 flex-1 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-signal-500/10 text-signal-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 pt-4">
          <p className="truncate text-sm font-medium text-slate-200">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {user.plan} plan
          </span>
          <button
            onClick={signOut}
            className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-ink-950/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400">
            ◈
          </span>
          TradeLens
        </Link>
        <div className="flex items-center gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs ${pathname === link.href ? "text-signal-400" : "text-slate-400"}`}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={signOut} className="text-xs text-slate-500">
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
