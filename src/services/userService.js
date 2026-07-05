"use client";

import { createClient } from "@/lib/supabase/browser";

const userColumns = "id, full_name, email, phone_number, role, status, created_at, updated_at";
export const USER_STATUSES = ["active", "inactive", "banned", "pending_verify"];

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

export async function listUsers({ page = 1, pageSize = DEFAULT_PAGE_SIZE, query = "", role = "all", status = "all" } = {}) {
  const supabase = createClient();

  if (!supabase) {
    return { ...missingConfigResult([]), count: 0, page, pageSize };
  }

  const range = getPageRange(page, pageSize);
  let request = supabase
    .from("users")
    .select(userColumns, { count: "exact" })
    .order("created_at", { ascending: false });

  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replaceAll(",", " ");
    request = request.or(
      `full_name.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%,phone_number.ilike.%${escapedQuery}%`,
    );
  }

  if (role !== "all") {
    request = request.eq("role", role);
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

export async function updateUserStatus(userId, status) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  if (!USER_STATUSES.includes(status)) {
    return { data: null, error: "Status must be active, inactive, banned, or pending verify." };
  }

  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId)
    .select(userColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}
