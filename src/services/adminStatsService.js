"use client";

import { createClient } from "@/lib/supabase/browser";

async function countRows(supabase, table, filter) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (filter) {
    query = filter(query);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getAdminStats() {
  const supabase = createClient();

  if (!supabase) {
    return {
      stats: {
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        pendingOrders: 0,
        openRestaurants: 0,
      },
      error: "Supabase environment variables are not configured.",
    };
  }

  try {
    const [totalUsers, totalRestaurants, totalOrders, pendingOrders, openRestaurants] =
      await Promise.all([
        countRows(supabase, "users"),
        countRows(supabase, "restaurants", (query) => query.is("deleted_at", null)),
        countRows(supabase, "orders"),
        countRows(supabase, "orders", (query) => query.eq("status", "pending")),
        countRows(supabase, "restaurants", (query) =>
          query.eq("is_open", true).eq("status", "active").is("deleted_at", null),
        ),
      ]);

    return {
      stats: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        pendingOrders,
        openRestaurants,
      },
      error: null,
    };
  } catch (error) {
    return {
      stats: {
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        pendingOrders: 0,
        openRestaurants: 0,
      },
      error: error.message,
    };
  }
}
