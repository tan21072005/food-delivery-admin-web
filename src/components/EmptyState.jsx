import Link from "next/link";

export function EmptyState({ title, description, actionHref, actionLabel }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
