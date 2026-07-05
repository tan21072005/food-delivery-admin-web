import { createClient } from "@/lib/supabase/server";
import { ROLES, getUserRole } from "@/lib/auth/roles";
import { validateOfferPayload } from "@/lib/validation/offer";
import { getSellerRestaurant } from "@/services/restaurantService";

export const OFFER_STATUSES = ["active", "inactive"];
const DEFAULT_PAGE_SIZE = 8;

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
  return Number.isFinite(number) ? number : fallback;
}

function cleanDateTime(value) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
}

function cleanOfferStatusFilter(value) {
  const status = cleanText(value);
  return OFFER_STATUSES.includes(status) ? status : "all";
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

export async function getSellerOffers({ page = 1, pageSize = DEFAULT_PAGE_SIZE, status = "all" } = {}) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured || error || !restaurant) {
    return { restaurant, offers: [], count: 0, page, pageSize, status, error, isConfigured };
  }

  const range = getPageRange(page, pageSize);
  const safeStatus = cleanOfferStatusFilter(status);
  let request = supabase
    .from("offers")
    .select("id, title, description, discount_type, discount_value, min_order_amount, starts_at, ends_at, status", {
      count: "exact",
    })
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  if (safeStatus !== "all") {
    request = request.eq("status", safeStatus);
  }

  const { data, error: offersError, count } = await request.range(range.from, range.to);

  return {
    restaurant,
    offers: data ?? [],
    count: count ?? 0,
    page: range.page,
    pageSize: range.pageSize,
    status: safeStatus,
    error: offersError,
    isConfigured,
  };
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

export async function getAdminOffers({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  status = "all",
  restaurantId = "all",
} = {}) {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured || error) {
    return { offers: [], restaurants: [], count: 0, page, pageSize, status, restaurantId, error, isConfigured };
  }

  const range = getPageRange(page, pageSize);
  const safeStatus = cleanOfferStatusFilter(status);
  const safeRestaurantId = restaurantId === "all" ? "all" : cleanText(restaurantId);
  let offerRequest = supabase.from("offers").select(offerColumns, { count: "exact" }).order("created_at", { ascending: false });

  if (safeStatus !== "all") {
    offerRequest = offerRequest.eq("status", safeStatus);
  }

  if (safeRestaurantId !== "all") {
    if (safeRestaurantId === "global") {
      offerRequest = offerRequest.is("restaurant_id", null);
    } else {
      offerRequest = offerRequest.eq("restaurant_id", safeRestaurantId);
    }
  }

  const [offerResult, restaurantResult] = await Promise.all([
    offerRequest.range(range.from, range.to),
    supabase.from("restaurants").select("id, name").is("deleted_at", null).order("name", { ascending: true }),
  ]);

  return {
    offers: offerResult.data ?? [],
    restaurants: restaurantResult.data ?? [],
    count: offerResult.count ?? 0,
    page: range.page,
    pageSize: range.pageSize,
    status: safeStatus,
    restaurantId: safeRestaurantId,
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
