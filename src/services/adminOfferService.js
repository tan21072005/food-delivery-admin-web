"use client";

import { createClient } from "@/lib/supabase/browser";

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

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
  };
}

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

function buildOfferPayload(values) {
  return {
    restaurant_id: values.restaurant_id ? Number(values.restaurant_id) : null,
    title: cleanText(values.title),
    description: cleanText(values.description),
    discount_type: cleanText(values.discount_type) ?? "percent",
    discount_value: cleanNumber(values.discount_value),
    min_order_amount: cleanNumber(values.min_order_amount),
    starts_at: cleanDateTime(values.starts_at),
    ends_at: cleanDateTime(values.ends_at),
    status: cleanText(values.status) ?? "active",
  };
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

export async function listOffers() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("offers")
    .select(offerColumns)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function listOfferRestaurants() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function createOffer(values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const payload = buildOfferPayload(values);
  const validationError = validateOfferPayload(payload);

  if (validationError) {
    return { data: null, error: validationError };
  }

  const { data, error } = await supabase.from("offers").insert(payload).select(offerColumns).single();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function updateOffer(offerId, values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const payload = buildOfferPayload(values);
  const validationError = validateOfferPayload(payload);

  if (validationError) {
    return { data: null, error: validationError };
  }

  const { data, error } = await supabase
    .from("offers")
    .update(payload)
    .eq("id", offerId)
    .select(offerColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function deactivateOffer(offerId) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const { data, error } = await supabase
    .from("offers")
    .update({ status: "inactive" })
    .eq("id", offerId)
    .select(offerColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}
