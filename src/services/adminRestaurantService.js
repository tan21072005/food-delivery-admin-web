"use client";

import { createClient } from "@/lib/supabase/browser";

const restaurantColumns = `
  id,
  name,
  description,
  phone_number,
  address,
  logo_url,
  avg_rating,
  total_reviews,
  is_open,
  status,
  created_at,
  owner:users!restaurants_owner_user_id_fkey (
    id,
    full_name,
    email
  ),
  cuisine:cuisines (
    id,
    name
  )
`;

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
  };
}

const DEFAULT_PAGE_SIZE = 10;

function getPageRange(page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1, page: safePage, pageSize: safePageSize };
}

export async function listRestaurants({ page = 1, pageSize = DEFAULT_PAGE_SIZE, query = "", status = "all" } = {}) {
  const supabase = createClient();

  if (!supabase) {
    return { ...missingConfigResult([]), count: 0, page, pageSize };
  }

  const range = getPageRange(page, pageSize);
  let request = supabase
    .from("restaurants")
    .select(restaurantColumns, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replaceAll(",", " ");
    request = request.or(`name.ilike.%${escapedQuery}%,address.ilike.%${escapedQuery}%,phone_number.ilike.%${escapedQuery}%`);
  }

  if (status !== "all") {
    request = request.eq("status", status);
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

export async function updateRestaurant(restaurantId, values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const payload = {
    name: values.name,
    description: values.description || null,
    phone_number: values.phone_number || null,
    address: values.address,
    is_open: Boolean(values.is_open),
    status: values.status,
  };

  const { data, error } = await supabase
    .from("restaurants")
    .update(payload)
    .eq("id", restaurantId)
    .select(restaurantColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}
