"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

function NavLinks({ items, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserPanel({ user, compact = false }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (!supabase) {
      router.replace("/login?status=signed-out");
      return;
    }

    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login?status=signed-out");
    router.refresh();
  }

  return (
    <div className={`rounded-md border border-white/10 bg-white/[0.04] p-3 ${compact ? "" : "mt-8"}`}>
      <p className="truncate text-sm font-medium text-white">{user?.email ?? "Signed in user"}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{user?.role ?? "unknown role"}</p>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-3 w-full rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? "Signing out..." : "Logout"}
      </button>
    </div>
  );
}

export function AppShellChrome({ section, items, user }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const portalLabel = section === "admin" ? "Admin Portal" : "Seller Portal";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:block">
        <Link href={`/${section}/dashboard`} className="block text-lg font-semibold">
          Food Delivery
        </Link>
        <p className="mt-1 text-sm text-slate-400">{portalLabel}</p>
        <NavLinks items={items} />
        <UserPanel user={user} />
      </aside>

      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-100 transition hover:bg-white/10"
          >
            <span className="h-0.5 w-5 bg-current shadow-[0_6px_0_current,0_-6px_0_current]" />
          </button>
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold text-white">Food Delivery</p>
            <p className="text-xs text-slate-400">{portalLabel}</p>
          </div>
        </div>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="relative flex h-full w-80 max-w-[86vw] flex-col border-r border-white/10 bg-slate-950 px-5 py-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/${section}/dashboard`}
                  onClick={() => setIsDrawerOpen(false)}
                  className="block text-lg font-semibold"
                >
                  Food Delivery
                </Link>
                <p className="mt-1 text-sm text-slate-400">{portalLabel}</p>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-xl leading-none text-slate-200 transition hover:bg-white/10"
              >
                x
              </button>
            </div>
            <NavLinks items={items} onNavigate={() => setIsDrawerOpen(false)} />
            <div className="mt-auto pt-6">
              <UserPanel user={user} compact />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
