"use client";

import { createClient } from "@/lib/supabase/browser";

const orderColumns = `
  id,
  status,
  subtotal,
  delivery_fee,
  discount_amount,
  total_amount,
  payment_method,
  payment_status,
  note,
  cancelled_reason,
  created_at,
  customer:users!orders_customer_id_fkey (
    id,
    full_name,
    email,
    phone_number
  ),
  restaurant:restaurants!orders_restaurant_id_fkey (
    id,
    name
  )
`;

const lineColumns = `
  id,
  order_id,
  item_name_snapshot,
  item_image_snapshot,
  quantity,
  unit_price_snapshot,
  options_snapshot_json,
  subtotal
`;

const DEFAULT_PAGE_SIZE = 10;

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
  };
}

function getPageRange(page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1, page: safePage, pageSize: safePageSize };
}

export async function listOrders({ page = 1, pageSize = DEFAULT_PAGE_SIZE, status = "all", restaurantId = "all" } = {}) {
  const supabase = createClient();

  if (!supabase) {
    return { ...missingConfigResult([]), count: 0, page, pageSize };
  }

  const range = getPageRange(page, pageSize);
  let request = supabase
    .from("orders")
    .select(orderColumns, { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    request = request.eq("status", status);
  }

  if (restaurantId !== "all") {
    request = request.eq("restaurant_id", restaurantId);
  }

  const { data, error, count } = await request.range(range.from, range.to);

  return {
    data: data ?? [],
    count: count ?? 0,
    error: error?.message ?? null,
    page: range.page,
    pageSize: range.pageSize,
  };
}

export async function listOrderRestaurants() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function listOrderLines(orderId) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("order_lines")
    .select(lineColumns)
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
