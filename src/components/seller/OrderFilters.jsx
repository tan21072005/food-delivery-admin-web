import Link from "next/link";
import { ORDER_STATUSES, formatStatus } from "@/services/orderService";

function buildStatusHref(status) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `/seller/orders?${query}` : "/seller/orders";
}

export function OrderFilters({ status }) {
  const options = ["all", ...ORDER_STATUSES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const isActive = status === option;

        return (
          <Link
            key={option}
            href={buildStatusHref(option)}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {option === "all" ? "All orders" : formatStatus(option)}
          </Link>
        );
      })}
    </div>
  );
}
