import Link from "next/link";

function buildPageHref(basePath, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  Array.from(params.entries()).forEach(([key, value]) => {
    if (!value) {
      params.delete(key);
    }
  });
  params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function UrlPaginationControls({ basePath, searchParams, page, pageSize, total }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const previousClass =
    page <= 1
      ? "pointer-events-none rounded-md border border-white/10 px-3 py-1.5 font-medium opacity-50"
      : "rounded-md border border-white/10 px-3 py-1.5 font-medium transition hover:bg-white/10";
  const nextClass =
    page >= pageCount
      ? "pointer-events-none rounded-md border border-white/10 px-3 py-1.5 font-medium opacity-50"
      : "rounded-md border border-white/10 px-3 py-1.5 font-medium transition hover:bg-white/10";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Link href={buildPageHref(basePath, searchParams, page - 1)} className={previousClass}>
          Previous
        </Link>
        <span className="min-w-20 text-center text-xs uppercase tracking-wide text-slate-400">
          {page} / {pageCount}
        </span>
        <Link href={buildPageHref(basePath, searchParams, page + 1)} className={nextClass}>
          Next
        </Link>
      </div>
    </div>
  );
}
