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

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
  };
}

export async function listOrders() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(orderColumns)
    .order("created_at", { ascending: false });

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