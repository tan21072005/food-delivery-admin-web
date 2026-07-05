import { OrderDetail } from "@/components/seller/OrderDetail";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { EmptyState } from "@/components/EmptyState";
import { formatStatus, formatVnd, getNextSellerStatus } from "@/services/orderService";

export function OrderTable({ orders, advanceAction }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="New orders will appear here automatically when customers place them."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const nextStatus = getNextSellerStatus(order.status);

        return (
          <article key={order.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-400">Order #{order.id}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{formatVnd(order.total_amount)}</h2>
                <p className="mt-1 text-sm text-slate-400">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
                  {formatStatus(order.status)}
                </span>
                {nextStatus ? (
                  <form action={advanceAction}>
                    <input type="hidden" name="order_id" value={order.id} />
                    <input type="hidden" name="next_status" value={nextStatus} />
                    <ConfirmSubmitButton
                      confirmMessage={`Move order #${order.id} to ${formatStatus(nextStatus)}?`}
                      pendingLabel="Updating..."
                      className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Move to {formatStatus(nextStatus)}
                    </ConfirmSubmitButton>
                  </form>
                ) : null}
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-emerald-300">View order items</summary>
              <div className="mt-3">
                <OrderDetail order={order} />
              </div>
            </details>
          </article>
        );
      })}
    </div>
  );
}
