import { createClient } from "@/lib/supabase/server";
import { MENU_ITEM_STATUS_OPTIONS, validateMenuItemPayload } from "@/lib/validation/menuItem";
import { getSellerRestaurant } from "@/services/restaurantService";
import { uploadRestaurantImage } from "@/services/imageUploadService";

export { MENU_ITEM_STATUS_OPTIONS } from "@/lib/validation/menuItem";

const MENU_ITEM_STATUSES = new Set(MENU_ITEM_STATUS_OPTIONS);
const DEFAULT_PAGE_SIZE = 8;

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function cleanPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanMenuItemStatus(value) {
  const status = cleanText(value) ?? "active";
  return MENU_ITEM_STATUSES.has(status) ? status : null;
}

function cleanMenuStatusFilter(value) {
  const status = cleanText(value);
  return MENU_ITEM_STATUSES.has(status) ? status : "all";
}

function getPageRange(page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1, page: safePage, pageSize: safePageSize };
}

async function categoryBelongsToRestaurant(supabase, categoryId, restaurantId) {
  if (!categoryId) {
    return true;
  }

  const { data, error } = await supabase
    .from("dish_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function getRestaurantContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, restaurant: null, error: null, isConfigured: false };
  }

  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  return { supabase, restaurant, error, isConfigured };
}

export async function getSellerMenuPageData({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  status = "all",
  categoryId = "all",
} = {}) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured || error || !restaurant) {
    return {
      restaurant,
      categories: [],
      menuItems: [],
      count: 0,
      page,
      pageSize,
      status,
      categoryId,
      error,
      isConfigured,
    };
  }

  const range = getPageRange(page, pageSize);
  const safeStatus = cleanMenuStatusFilter(status);
  const safeCategoryId = categoryId === "all" ? "all" : cleanText(categoryId);
  let menuRequest = supabase
    .from("menu_items")
    .select("id, dish_category_id, name, description, base_price, image_url, status, sold_count, dish_categories(name)", {
      count: "exact",
    })
    .eq("restaurant_id", restaurant.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (safeStatus !== "all") {
    menuRequest = menuRequest.eq("status", safeStatus);
  }

  if (safeCategoryId !== "all") {
    menuRequest = menuRequest.eq("dish_category_id", safeCategoryId);
  }

  const [categories, menuItems] = await Promise.all([
    supabase
      .from("dish_categories")
      .select("id, name, status")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    menuRequest.range(range.from, range.to),
  ]);

  return {
    restaurant,
    categories: categories.data ?? [],
    menuItems: menuItems.data ?? [],
    count: menuItems.count ?? 0,
    page: range.page,
    pageSize: range.pageSize,
    status: safeStatus,
    categoryId: safeCategoryId,
    error: categories.error ?? menuItems.error,
    isConfigured,
  };
}

export async function createMenuItem(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const name = cleanText(formData.get("name"));
  const basePrice = cleanPrice(formData.get("base_price"));
  const dishCategoryId = cleanText(formData.get("dish_category_id"));
  const status = cleanMenuItemStatus(formData.get("status"));
  const payload = {
    restaurant_id: restaurant.id,
    dish_category_id: dishCategoryId,
    name,
    description: cleanText(formData.get("description")),
    base_price: basePrice,
    image_url: cleanText(formData.get("image_url")),
    status,
  };
  const validationError = validateMenuItemPayload({ ...payload, image_file: formData.get("image_file") });

  if (validationError) {
    return { ok: false, message: validationError };
  }

  if (!(await categoryBelongsToRestaurant(supabase, dishCategoryId, restaurant.id))) {
    return { ok: false, message: "Selected category was not found for this restaurant." };
  }

  const imageUpload = await uploadRestaurantImage(supabase, formData.get("image_file"), [
    String(restaurant.id),
    "menu",
  ]);

  if (imageUpload.error) {
    return { ok: false, message: imageUpload.error };
  }

  if (imageUpload.url) {
    payload.image_url = imageUpload.url;
  }

  const { error: insertError } = await supabase.from("menu_items").insert(payload);
  return insertError ? { ok: false, message: insertError.message } : { ok: true, message: "Menu item created." };
}

export async function updateMenuItem(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const id = cleanText(formData.get("id"));
  const name = cleanText(formData.get("name"));
  const basePrice = cleanPrice(formData.get("base_price"));
  const dishCategoryId = cleanText(formData.get("dish_category_id"));
  const status = cleanMenuItemStatus(formData.get("status"));

  if (!id) {
    return { ok: false, message: "Item id is required." };
  }

  const payload = {
    dish_category_id: dishCategoryId,
    name,
    description: cleanText(formData.get("description")),
    base_price: basePrice,
    image_url: cleanText(formData.get("image_url")),
    status,
  };
  const validationError = validateMenuItemPayload({ ...payload, image_file: formData.get("image_file") });

  if (validationError) {
    return { ok: false, message: validationError };
  }

  if (!(await categoryBelongsToRestaurant(supabase, dishCategoryId, restaurant.id))) {
    return { ok: false, message: "Selected category was not found for this restaurant." };
  }

  const imageUpload = await uploadRestaurantImage(supabase, formData.get("image_file"), [
    String(restaurant.id),
    "menu",
  ]);

  if (imageUpload.error) {
    return { ok: false, message: imageUpload.error };
  }

  if (imageUpload.url) {
    payload.image_url = imageUpload.url;
  }

  const { error: updateError } = await supabase
    .from("menu_items")
    .update(payload)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Menu item updated." };
}

export async function deactivateMenuItem(formData) {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!restaurant) return { ok: false, message: "Restaurant profile was not found for this seller." };

  const id = cleanText(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Item id is required." };
  }

  const { error: updateError } = await supabase
    .from("menu_items")
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  return updateError ? { ok: false, message: updateError.message } : { ok: true, message: "Menu item deactivated." };
}

export function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}
