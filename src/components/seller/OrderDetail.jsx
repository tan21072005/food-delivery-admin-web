import { formatVnd } from "@/services/orderService";

export function OrderDetail({ order }) {
  return (
    <div className="space-y-3 rounded-md border border-white/10 bg-slate-950/50 p-4">
      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <p>Payment: {order.payment_method} / {order.payment_status}</p>
        <p>Total: {formatVnd(order.total_amount)}</p>
        {order.note ? <p className="sm:col-span-2">Note: {order.note}</p> : null}
      </div>
      <div className="divide-y divide-white/10">
        {order.order_lines?.map((line) => (
          <div key={line.id} className="flex items-start justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium text-white">{line.item_name_snapshot}</p>
              <p className="mt-1 text-slate-400">Qty {line.quantity} x {formatVnd(line.unit_price_snapshot)}</p>
            </div>
            <p className="text-slate-200">{formatVnd(line.subtotal)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
