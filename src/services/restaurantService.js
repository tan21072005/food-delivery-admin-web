import { createClient } from "@/lib/supabase/server";

export function splitRestaurantAddress(address) {
  if (!address) {
    return { addressDetail: "", locality: "" };
  }

  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  if (parts.length <= 1) {
    return { addressDetail: address, locality: "" };
  }

  return {
    addressDetail: parts.slice(0, -2).join(", ") || parts[0],
    locality: parts.slice(-2).join(", "),
  };
}

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

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function combineAddress(addressDetail, locality) {
  return [cleanText(addressDetail), cleanText(locality)].filter(Boolean).join(", ");
}

async function getRestaurantOwnerUser(supabase) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { appUser: null, error: userError ?? new Error("Not authenticated") };
  }

  const { data: appUser, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_uid", user.id)
    .eq("role", "restaurant_owner")
    .maybeSingle();

  if (error || !appUser) {
    return { appUser: null, error: error ?? new Error("Authenticated user is not a restaurant owner") };
  }

  return { appUser, error: null };
}

export async function getSellerRestaurant() {
  const supabase = await createClient();

  if (!supabase) {
    return { restaurant: null, error: null, isConfigured: false };
  }

  const { appUser, error: ownerError } = await getRestaurantOwnerUser(supabase);

  if (ownerError || !appUser) {
    return { restaurant: null, error: ownerError, isConfigured: true };
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

export async function updateSellerRestaurantProfile(formData) {
  const supabase = await createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const { restaurant, error: restaurantError } = await getSellerRestaurant();

  if (restaurantError) {
    return { ok: false, message: restaurantError.message };
  }

  if (!restaurant) {
    return { ok: false, message: "Restaurant profile was not found for this seller." };
  }

  const name = cleanText(formData.get("name"));
  const address = combineAddress(formData.get("address_detail"), formData.get("locality"));

  if (!name || !address) {
    return { ok: false, message: "Name and address are required." };
  }

  const payload = {
    name,
    description: cleanText(formData.get("description")),
    phone_number: cleanText(formData.get("phone_number")),
    address,
    logo_url: cleanText(formData.get("logo_url")),
    cover_url: cleanText(formData.get("cover_url")),
    is_open: formData.get("is_open") === "on",
  };

  const { error } = await supabase
    .from("restaurants")
    .update(payload)
    .eq("id", restaurant.id)
    .eq("owner_user_id", restaurant.owner_user_id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Restaurant profile updated." };
}

export function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
