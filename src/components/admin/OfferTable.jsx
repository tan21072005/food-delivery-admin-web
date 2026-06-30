import { OfferForm } from "@/components/admin/OfferForm";
import { formatDiscount, formatVnd } from "@/services/offerService";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Not set";
}

export function OfferTable({ offers, restaurants, updateAction, deactivateAction }) {
  if (offers.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
        No offers yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {offers.map((offer) => (
              <tr key={offer.id} className="align-top">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{offer.title}</p>
                  <p className="mt-1 max-w-sm text-slate-400">{offer.description}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{offer.restaurant?.name ?? "Global"}</td>
                <td className="px-4 py-4 text-slate-200">{formatDiscount(offer)}</td>
                <td className="px-4 py-4 text-slate-300">{formatVnd(offer.min_order_amount)}</td>
                <td className="px-4 py-4 text-slate-300">
                  <p>{formatDate(offer.starts_at)}</p>
                  <p>{formatDate(offer.ends_at)}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{offer.status}</td>
                <td className="space-y-3 px-4 py-4">
                  <details>
                    <summary className="cursor-pointer text-emerald-300">Edit</summary>
                    <div className="mt-3 w-[620px] max-w-[76vw]">
                      <OfferForm
                        offer={offer}
                        restaurants={restaurants}
                        action={updateAction}
                        submitLabel="Save offer"
                      />
                    </div>
                  </details>

                  <form action={deactivateAction}>
                    <input type="hidden" name="id" value={offer.id} />
                    <button
                      type="submit"
                      disabled={offer.status === "inactive"}
                      className="text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:text-slate-500"
                    >
                      Set inactive
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
