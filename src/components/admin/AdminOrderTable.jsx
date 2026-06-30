"use client";

import { useEffect, useMemo, useState } from "react";
import { listOrderLines, listOrders } from "@/services/adminOrderService";

const statuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "delivering",
  "completed",
  "cancelled",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseOptions(options) {
  if (!options) {
    return [];
  }

  if (Array.isArray(options)) {
    return options;
  }

  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AdminOrderTable() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingLines, setLoadingLines] = useState(false);
  const [error, setError] = useState(null);
  const [lineError, setLineError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setLoading(true);
      const result = await listOrders();

      if (!mounted) {
        return;
      }

      setOrders(result.data);
      setError(result.error);
      setLoading(false);
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const restaurants = useMemo(() => {
    const unique = new Map();
    orders.forEach((order) => {
      if (order.restaurant?.id) {
        unique.set(order.restaurant.id, order.restaurant.name);
      }
    });
    return Array.from(unique, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesRestaurant =
        restaurantFilter === "all" || String(order.restaurant?.id) === restaurantFilter;

      return matchesStatus && matchesRestaurant;
    });
  }, [orders, restaurantFilter, statusFilter]);

  async function selectOrder(order) {
    setSelectedOrder(order);
    setOrderLines([]);
    setLineError(null);
    setLoadingLines(true);

    const result = await listOrderLines(order.id);
    setOrderLines(result.data);
    setLineError(result.error);
    setLoadingLines(false);
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={restaurantFilter}
          onChange={(event) => setRestaurantFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All restaurants</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Restaurant</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : null}

                {!loading && filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      No orders found.
                    </td>
                  </tr>
                ) : null}

                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition hover:bg-white/[0.03]"
                    onClick={() => selectOrder(order)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">#{order.id}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <div>{order.customer?.full_name ?? "Unknown"}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customer?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{order.restaurant?.name ?? "-"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {order.payment_method} / {order.payment_status}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">{formatCurrency(order.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold text-white">
            {selectedOrder ? `Order #${selectedOrder.id}` : "Select an order"}
          </h2>

          {selectedOrder ? (
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <p className="text-xs uppercase text-slate-500">Subtotal</p>
                  <p className="mt-1 text-white">{formatCurrency(selectedOrder.subtotal)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Delivery</p>
                  <p className="mt-1 text-white">{formatCurrency(selectedOrder.delivery_fee)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Discount</p>
                  <p className="mt-1 text-white">{formatCurrency(selectedOrder.discount_amount)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Total</p>
                  <p className="mt-1 text-white">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {selectedOrder.note ? (
                <p className="rounded-md border border-white/10 bg-slate-950/50 p-3 text-slate-300">
                  {selectedOrder.note}
                </p>
              ) : null}

              {lineError ? (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  {lineError}
                </div>
              ) : null}

              <div className="space-y-3">
                {loadingLines ? <p className="text-slate-400">Loading order items...</p> : null}
                {!loadingLines && orderLines.length === 0 ? (
                  <p className="text-slate-400">No order items found.</p>
                ) : null}
                {orderLines.map((line) => {
                  const options = parseOptions(line.options_snapshot_json);

                  return (
                    <div key={line.id} className="rounded-md border border-white/10 bg-slate-950/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{line.item_name_snapshot}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {line.quantity} x {formatCurrency(line.unit_price_snapshot)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white">{formatCurrency(line.subtotal)}</p>
                      </div>
                      {options.length > 0 ? (
                        <div className="mt-2 space-y-1 text-xs text-slate-400">
                          {options.map((option, index) => (
                            <p key={`${line.id}-${index}`}>
                              {option.name} {option.price_delta ? `+ ${formatCurrency(option.price_delta)}` : ""}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Order items and payment summary appear here.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
