"use client";

import { useEffect } from "react";

export function RouteErrorState({ error, unstable_retry, title = "Something went wrong" }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Runtime error</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The workspace could not finish loading. Try again, or check the server logs if this keeps happening.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-6 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
