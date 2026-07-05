import { MenuForm } from "@/components/seller/MenuForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { EmptyState } from "@/components/EmptyState";
import { formatVnd } from "@/services/menuService";

export function MenuTable({ items, categories, updateAction, deactivateAction }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No menu items found"
        description="Create the first item above, or adjust the filters to see more of this restaurant menu."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-white/[0.06] text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Sold</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="px-4 py-4">
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 max-w-sm text-slate-400">{item.description}</p>
              </td>
              <td className="px-4 py-4 text-slate-300">{item.dish_categories?.name ?? "Uncategorized"}</td>
              <td className="px-4 py-4 text-slate-200">{formatVnd(item.base_price)}</td>
              <td className="px-4 py-4 text-slate-300">{item.status}</td>
              <td className="px-4 py-4 text-slate-300">{item.sold_count}</td>
              <td className="space-y-3 px-4 py-4">
                <details>
                  <summary className="cursor-pointer text-emerald-300">Edit</summary>
                  <div className="mt-3 w-[520px] max-w-[70vw]">
                    <MenuForm categories={categories} item={item} action={updateAction} submitLabel="Save item" />
                  </div>
                </details>
                <form action={deactivateAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Set ${item.name} inactive?`}
                    pendingLabel="Updating..."
                    className="text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Set inactive
                  </ConfirmSubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
