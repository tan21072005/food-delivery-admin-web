"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getHomePathForRole, getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirectTo");
  const authError = searchParams.get("error");
  const status = searchParams.get("status");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured. Add values to .env.local from .env.example.");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const role = getUserRole(data.user);
    const fallbackPath = getHomePathForRole(role);
    router.replace(redirectTo || fallbackPath);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-2xl shadow-black/30 md:grid-cols-[1fr_0.85fr]">
        <div className="flex min-h-[520px] flex-col justify-between bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.24),transparent_28%),linear-gradient(135deg,#0f172a,#020617)] p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Food Delivery Admin
            </p>
            <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
              Manage restaurant operations from one focused workspace.
            </h1>
          </div>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">Admin routes require the admin role.</div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">Seller routes accept seller or restaurant roles.</div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">Customer accounts stay outside dashboards.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col justify-center p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use a Supabase Auth user with role stored in app_metadata.role.
          </p>

          {authError === "session_expired" ? (
            <p className="mt-5 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Your session expired. Sign in again to continue.
            </p>
          ) : null}

          {status === "signed-out" ? (
            <p className="mt-5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              You have been signed out.
            </p>
          ) : null}

          {status === "signed-up" ? (
            <p className="mt-5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Account confirmed. Sign in to continue.
            </p>
          ) : null}

          <label className="mt-6 text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300"
          />

          <label className="mt-4 text-sm font-medium text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-11 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {message ? <p className="mt-4 text-sm text-rose-200">{message}</p> : null}

          <div className="mt-5 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/signup" className="font-medium text-emerald-300 transition hover:text-emerald-200">
              Create customer account
            </Link>
            <Link href="/seller/apply" className="font-medium text-emerald-300 transition hover:text-emerald-200">
              Apply as seller
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
