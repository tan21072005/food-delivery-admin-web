export function TableSkeletonRows({ columns, rows = 5 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: columns }).map((__, columnIndex) => (
        <td key={columnIndex} className="px-4 py-4">
          <div
            className={`h-4 animate-pulse rounded bg-white/10 ${
              columnIndex === 0 ? "w-32" : columnIndex % 2 === 0 ? "w-20" : "w-24"
            }`}
          />
          {columnIndex === 0 ? <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" /> : null}
        </td>
      ))}
    </tr>
  ));
}

export function TableEmptyStateRow({ colSpan, title, description }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8">
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-5 py-7 text-center">
          <p className="text-sm font-semibold text-white">{title}</p>
          {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
      </td>
    </tr>
  );
}
