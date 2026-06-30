export function MenuForm({ categories, item, action, submitLabel }) {
  return (
    <form action={action} className="grid gap-4 rounded-md border border-white/10 bg-slate-950/50 p-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" defaultValue={item.id} /> : null}

      <label className="space-y-2 text-sm text-slate-300">
        <span>Name</span>
        <input name="name" defaultValue={item?.name ?? ""} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Category</span>
        <select name="dish_category_id" defaultValue={item?.dish_category_id ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300">
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Base price</span>
        <input name="base_price" type="number" min="0" step="1000" defaultValue={item?.base_price ?? ""} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Status</span>
        <select name="status" defaultValue={item?.status ?? "active"} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300">
          <option value="active">Active</option>
          <option value="sold_out">Sold out</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Description</span>
        <textarea name="description" rows={2} defaultValue={item?.description ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Image URL</span>
        <input name="image_url" type="url" defaultValue={item?.image_url ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
      </label>

      <div className="flex justify-end md:col-span-2">
        <button type="submit" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
