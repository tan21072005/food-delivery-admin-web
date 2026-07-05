export function MetricCard({ label, value, helper, loading = false }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      {loading ? (
        <div className="mt-4 h-8 w-20 animate-pulse rounded bg-white/10" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      )}
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
