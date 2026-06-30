function toInputDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function OfferForm({ offer, action, submitLabel }) {
  return (
    <form action={action} className="grid gap-4 rounded-md border border-white/10 bg-slate-950/50 p-4 md:grid-cols-2">
      {offer ? <input type="hidden" name="id" defaultValue={offer.id} /> : null}

      <label className="space-y-2 text-sm text-slate-300">
        <span>Title</span>
        <input name="title" defaultValue={offer?.title ?? ""} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Status</span>
        <select name="status" defaultValue={offer?.status ?? "active"} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Discount type</span>
        <select name="discount_type" defaultValue={offer?.discount_type ?? "percent"} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed amount</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Discount value</span>
        <input name="discount_value" type="number" min="0" step="1000" defaultValue={offer?.discount_value ?? ""} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Minimum order</span>
        <input name="min_order_amount" type="number" min="0" step="1000" defaultValue={offer?.min_order_amount ?? 0} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Starts at</span>
        <input name="starts_at" type="datetime-local" defaultValue={toInputDateTime(offer?.starts_at)} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Ends at</span>
        <input name="ends_at" type="datetime-local" defaultValue={toInputDateTime(offer?.ends_at)} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Description</span>
        <textarea name="description" rows={2} defaultValue={offer?.description ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <div className="flex justify-end md:col-span-2">
        <button type="submit" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
