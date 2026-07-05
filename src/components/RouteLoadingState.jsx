export function RouteLoadingState({ section = "Workspace" }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:block">
        <div className="h-6 w-36 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/5" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-9 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="border-b border-white/10 bg-slate-900/70 px-5 py-5">
          <div className="mx-auto max-w-6xl">
            <div className="h-3 w-28 animate-pulse rounded bg-emerald-300/20" />
            <div className="mt-4 h-8 w-64 max-w-full animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-[32rem] max-w-full animate-pulse rounded bg-white/5" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">
          <p className="sr-only">Loading {section}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
            ))}
          </div>
          <div className="mt-6 h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        </main>
      </div>
    </div>
  );
}
