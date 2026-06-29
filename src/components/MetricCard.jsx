export function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
