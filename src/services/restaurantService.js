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

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function combineAddress(addressDetail, locality) {
  return [cleanText(addressDetail), cleanText(locality)].filter(Boolean).join(", ");
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

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, description, phone_number, address, logo_url, cover_url, is_open, status")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { restaurant: data, error, isConfigured: true };
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

  const { error } = await supabase.from("restaurants").update(payload).eq("id", restaurant.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Restaurant profile updated." };
}
