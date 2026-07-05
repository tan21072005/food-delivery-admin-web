import Link from "next/link";
import { getHomePathForRole, getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Unauthorized | Food Delivery Admin",
};

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const role = getUserRole(user);
  const homePath = getHomePathForRole(role);
  const hasDashboard = homePath !== "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Access limited</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">You are signed in, but not allowed here.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your current role{role ? ` (${role})` : ""} does not have permission to open that dashboard. Your session is still active.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={hasDashboard ? homePath : "/login"}
            className="rounded-md bg-emerald-400 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            {hasDashboard ? "Go to my dashboard" : "Go to login"}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/10 px-4 py-2 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Use another account
          </Link>
        </div>
      </section>
    </main>
  );
}
