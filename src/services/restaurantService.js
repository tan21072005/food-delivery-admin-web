import { createClient } from "@/lib/supabase/server";

function getTodayBounds(timeZone = "Asia/Ho_Chi_Minh") {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const start = new Date(`${values.year}-${values.month}-${values.day}T00:00:00+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function sumAmounts(rows) {
  return rows.reduce((total, row) => total + Number(row.total_amount ?? 0), 0);
}

export async function getSellerRestaurant() {
  const supabase = await createClient();

  if (!supabase) {
    return { restaurant: null, error: null, isConfigured: false };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { restaurant: null, error: userError ?? new Error("Not authenticated"), isConfigured: true };
  }

  const { data: appUser, error: appUserError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_uid", user.id)
    .eq("role", "restaurant_owner")
    .maybeSingle();

  if (appUserError || !appUser) {
    return {
      restaurant: null,
      error: appUserError ?? new Error("Authenticated user is not a restaurant owner"),
      isConfigured: true,
    };
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, owner_user_id, name, description, phone_number, address, logo_url, cover_url, is_open, status, avg_rating, total_reviews",
    )
    .eq("owner_user_id", appUser.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    restaurant: data,
    error,
    isConfigured: true,
  };
}

export async function getSellerDashboardMetrics() {
  const restaurantResult = await getSellerRestaurant();

  if (!restaurantResult.isConfigured || restaurantResult.error || !restaurantResult.restaurant) {
    return {
      ...restaurantResult,
      metrics: {
        todayOrders: 0,
        pendingOrders: 0,
        estimatedRevenue: 0,
        activeMenuItems: 0,
      },
    };
  }

  const supabase = await createClient();
  const restaurantId = restaurantResult.restaurant.id;
  const today = getTodayBounds();

  const [todayOrders, pendingOrders, todayRevenueRows, activeMenuItems] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", today.start)
      .lt("created_at", today.end),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("total_amount")
      .eq("restaurant_id", restaurantId)
      .neq("status", "cancelled")
      .gte("created_at", today.start)
      .lt("created_at", today.end),
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  const error = todayOrders.error ?? pendingOrders.error ?? todayRevenueRows.error ?? activeMenuItems.error;

  return {
    ...restaurantResult,
    error,
    metrics: {
      todayOrders: todayOrders.count ?? 0,
      pendingOrders: pendingOrders.count ?? 0,
      estimatedRevenue: sumAmounts(todayRevenueRows.data ?? []),
      activeMenuItems: activeMenuItems.count ?? 0,
    },
  };
}

export function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
