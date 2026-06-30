import { createClient } from "@/lib/supabase/server";
import { ROLES, getUserRole } from "@/lib/auth/roles";
import { getSellerRestaurant } from "@/services/restaurantService";

const offerColumns = `
  id,
  restaurant_id,
  title,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  starts_at,
  ends_at,
  status,
  created_at,
  restaurant:restaurants!offers_restaurant_id_fkey (
    id,
    name
  )
`;

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function cleanNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function cleanDateTime(value) {
  const text = cleanText(value);
  return text ? new Date(text).toISOString() : null;
}

async function getRestaurantContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, restaurant: null, error: null, isConfigured: false };
  }

  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  return { supabase, restaurant, error, isConfigured };
}

async function getAdminContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, error: null, isConfigured: false };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { supabase, error, isConfigured: true };
  }

  if (getUserRole(user) !== ROLES.ADMIN) {
    return { supabase, error: new Error("Admin access is required."), isConfigured: true };
  }

  return { supabase, error: null, isConfigured: true };
}

export async function getSellerOffers() {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured || error || !restaurant) {
    return { restaurant, offers: [], error, isConfigured };
  }

  const { data, error: offersError } = await supabase
    .from("offers")
    .select("id, title, description, discount_type, discount_value, min_order_amount, starts_at, ends_at, status")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return { restaurant, offers: data ?? [], error: offersError, isConfigured };
}

function buildOfferPayload(formData, restaurantId) {
  return {
    restaurant_id: restaurantId,
    title: cleanText(formData.get("title")),
    description: cleanText(formData.get("description")),
    discount_type: cleanText(formData.get("discount_type")) ?? "percent",
    discount_value: cleanNumber(formData.get("discount_value")),
    min_order_amount: cleanNumber(formData.get("min_order_amount")),
    starts_at: cleanDateTime(formData.get("starts_at")),
    ends_at: cleanDateTime(formData.get("ends_at")),
    status: cleanText(formData.get("status")) ?? "active",
  };
}

function buildAdminOfferPayload(formData) {
  const restaurantId = cleanText(formData.get("restaurant_id"));

  return buildOfferPayload(formData, restaurantId ? Number(restaurantId) : null);
}

function validateOfferPayload(payload) {
  if (!payload.title || payload.discount_value <= 0) {
    return "Title and discount value greater than 0 are required.";
  }

  if (!["percent", "fixed"].includes(payload.discount_type)) {
    return "Discount type must be percent or fixed.";
  }

  if (!["active", "inactive"].includes(payload.status)) {
    return "Status must be active or inactive.";
  }

  if (payload.discount_type === "percent" && payload.discount_value > 100) {
    return "Percent discounts cannot exceed 100.";
  }

  if (payload.starts_at && payload.ends_at && payload.starts_at >= payload.ends_at) {
    return "Start time must be before end time.";
  }

  return null;
}

export async function createOffer(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const payload = buildOfferPayload(formData, restaurant.id);
  const validationError = validateOfferPayload(payload);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { error: insertError } = await supabase.from("offers").insert(payload);
  return insertError ? { ok: false, message: insertError.message } : { ok: true, message: "Offer created." };
}

export async function updateOffer(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const id = cleanText(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Offer id is required." };
  }

  const { restaurant_id: _restaurantId, ...payload } = buildOfferPayload(formData, restaurant.id);
  const validationError = validateOfferPayload({ ...payload, restaurant_id: restaurant.id });

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update(payload)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Offer updated." };
}

export async function deactivateOffer(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const id = cleanText(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Offer id is required." };
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Offer deactivated." };
}

export async function getAdminOffers() {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured || error) {
    return { offers: [], restaurants: [], error, isConfigured };
  }

  const [offerResult, restaurantResult] = await Promise.all([
    supabase.from("offers").select(offerColumns).order("created_at", { ascending: false }),
    supabase.from("restaurants").select("id, name").is("deleted_at", null).order("name", { ascending: true }),
  ]);

  return {
    offers: offerResult.data ?? [],
    restaurants: restaurantResult.data ?? [],
    error: offerResult.error ?? restaurantResult.error,
    isConfigured,
  };
}

export async function createAdminOffer(formData) {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };

  const payload = buildAdminOfferPayload(formData);
  const validationError = validateOfferPayload(payload);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { error: insertError } = await supabase.from("offers").insert(payload);
  return insertError ? { ok: false, message: insertError.message } : { ok: true, message: "Offer created." };
}

export async function updateAdminOffer(formData) {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };

  const id = cleanText(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Offer id is required." };
  }

  const payload = buildAdminOfferPayload(formData);
  const validationError = validateOfferPayload(payload);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { error: updateError } = await supabase.from("offers").update(payload).eq("id", id);
  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Offer updated." };
}

export async function deactivateAdminOffer(formData) {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };

  const id = cleanText(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Offer id is required." };
  }

  const { error: updateError } = await supabase.from("offers").update({ status: "inactive" }).eq("id", id);
  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Offer set inactive." };
}

export function formatDiscount(offer) {
  if (offer.discount_type === "percent") {
    return `${Number(offer.discount_value)}%`;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(offer.discount_value ?? 0));
}

export function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}
