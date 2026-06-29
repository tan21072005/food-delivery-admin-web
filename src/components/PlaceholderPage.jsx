import { AppShell } from "@/components/AppShell";

export function PlaceholderPage({ section, title, description, items }) {
  return (
    <AppShell section={section} title={title} description={description}>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Feature foundation</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
