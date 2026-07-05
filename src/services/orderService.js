import { createClient } from "@/lib/supabase/server";
import { getSellerRestaurant } from "@/services/restaurantService";

export const SELLER_STATUS_FLOW = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready_for_pickup",
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "delivering",
  "completed",
  "cancelled",
];

const DEFAULT_PAGE_SIZE = 8;

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function cleanStatus(value) {
  const status = cleanText(value);
  return ORDER_STATUSES.includes(status) ? status : "all";
}

function getPageRange(page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1, page: safePage, pageSize: safePageSize };
}

async function getRestaurantContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, restaurant: null, error: null, isConfigured: false };
  }

  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  return { supabase, restaurant, error, isConfigured };
}

export async function getSellerOrders({ page = 1, pageSize = DEFAULT_PAGE_SIZE, status = "all" } = {}) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured || error || !restaurant) {
    return { restaurant, orders: [], count: 0, pendingCount: 0, page, pageSize, status, error, isConfigured };
  }

  const range = getPageRange(page, pageSize);
  const safeStatus = cleanStatus(status);
  let orderRequest = supabase
    .from("orders")
    .select(
      "id, status, subtotal, delivery_fee, discount_amount, total_amount, payment_method, payment_status, note, created_at, order_lines(id, item_name_snapshot, quantity, unit_price_snapshot, subtotal, options_snapshot_json)",
      { count: "exact" },
    )
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  if (safeStatus !== "all") {
    orderRequest = orderRequest.eq("status", safeStatus);
  }

  const [{ data, error: ordersError, count }, pendingResult] = await Promise.all([
    orderRequest.range(range.from, range.to),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .eq("status", "pending"),
  ]);

  return {
    restaurant,
    orders: data ?? [],
    count: count ?? 0,
    pendingCount: pendingResult.count ?? 0,
    page: range.page,
    pageSize: range.pageSize,
    status: safeStatus,
    error: ordersError ?? pendingResult.error,
    isConfigured,
  };
}

export async function advanceOrderStatus(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const orderId = cleanText(formData.get("order_id"));
  const nextStatus = cleanText(formData.get("next_status"));

  if (!orderId || !nextStatus) {
    return { ok: false, message: "Order id and next status are required." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, restaurant_id")
    .eq("id", orderId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (orderError) return { ok: false, message: orderError.message };
  if (!order) return { ok: false, message: "Order was not found for this restaurant." };

  const allowedNext = SELLER_STATUS_FLOW[order.status];

  if (allowedNext !== nextStatus) {
    return { ok: false, message: `Cannot move order from ${order.status} to ${nextStatus}.` };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", order.id)
    .eq("restaurant_id", restaurant.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: nextStatus,
    changed_by_user_id: restaurant.owner_user_id,
    note: "Updated from seller portal",
  });

  return { ok: true, message: "Order status updated." };
}

export function getNextSellerStatus(status) {
  return SELLER_STATUS_FLOW[status] ?? null;
}

export function formatStatus(status) {
  if (status === "ready_for_pickup") {
    return "ready";
  }

  return status?.replaceAll("_", " ") ?? "";
}

export function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}
