import { createClient } from "@/lib/supabase/server";
import { getSellerRestaurant } from "@/services/restaurantService";

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function cleanPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

async function getRestaurantContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, restaurant: null, error: null, isConfigured: false };
  }

  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  return { supabase, restaurant, error, isConfigured };
}

export async function getSellerMenuPageData() {
  const { supabase, restaurant, error, isConfigured } = await getRestaurantContext();

  if (!isConfigured || error || !restaurant) {
    return { restaurant, categories: [], menuItems: [], error, isConfigured };
  }

  const [categories, menuItems] = await Promise.all([
    supabase
      .from("dish_categories")
      .select("id, name, status")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("id, dish_category_id, name, description, base_price, image_url, status, sold_count, dish_categories(name)")
      .eq("restaurant_id", restaurant.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return {
    restaurant,
    categories: categories.data ?? [],
    menuItems: menuItems.data ?? [],
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

  if (!name || basePrice === null) {
    return { ok: false, message: "Name and a valid price are required." };
  }

  const payload = {
    restaurant_id: restaurant.id,
    dish_category_id: cleanText(formData.get("dish_category_id")),
    name,
    description: cleanText(formData.get("description")),
    base_price: basePrice,
    image_url: cleanText(formData.get("image_url")),
    status: cleanText(formData.get("status")) ?? "active",
  };

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

  if (!id || !name || basePrice === null) {
    return { ok: false, message: "Item id, name, and a valid price are required." };
  }

  const payload = {
    dish_category_id: cleanText(formData.get("dish_category_id")),
    name,
    description: cleanText(formData.get("description")),
    base_price: basePrice,
    image_url: cleanText(formData.get("image_url")),
    status: cleanText(formData.get("status")) ?? "active",
  };

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
