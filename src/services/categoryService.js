"use client";

import { createClient } from "@/lib/supabase/browser";

const categoryColumns = `
  id,
  restaurant_id,
  name,
  slug,
  sort_order,
  status,
  created_at,
  restaurant:restaurants!dish_categories_restaurant_id_fkey (
    id,
    name
  )
`;

const CATEGORY_STATUSES = new Set(["active", "inactive"]);

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

function buildCategoryPayload(values) {
  const restaurantId = Number(values.restaurant_id);
  const sortOrder = Number(values.sort_order || 0);
  const status = cleanText(values.status) ?? "active";

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return { payload: null, error: "Restaurant is required." };
  }

  if (!cleanText(values.name)) {
    return { payload: null, error: "Category name is required." };
  }

  if (!cleanText(values.slug)) {
    return { payload: null, error: "Category slug is required." };
  }

  if (!Number.isFinite(sortOrder)) {
    return { payload: null, error: "Sort order must be a valid number." };
  }

  if (!CATEGORY_STATUSES.has(status)) {
    return { payload: null, error: "Status must be active or inactive." };
  }

  return {
    payload: {
      restaurant_id: restaurantId,
      name: cleanText(values.name),
      slug: cleanText(values.slug),
      sort_order: sortOrder,
      status,
    },
    error: null,
  };
}

export async function listCategories() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("dish_categories")
    .select(categoryColumns)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function listCategoryRestaurants() {
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

export async function createCategory(values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const { payload, error: validationError } = buildCategoryPayload(values);

  if (validationError) {
    return { data: null, error: validationError };
  }

  const { data, error } = await supabase
    .from("dish_categories")
    .insert(payload)
    .select(categoryColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function updateCategory(categoryId, values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const { payload, error: validationError } = buildCategoryPayload(values);

  if (validationError) {
    return { data: null, error: validationError };
  }

  const { data, error } = await supabase
    .from("dish_categories")
    .update(payload)
    .eq("id", categoryId)
    .select(categoryColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function deleteCategory(categoryId) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const { error } = await supabase.from("dish_categories").delete().eq("id", categoryId);

  return {
    data: null,
    error: error?.message ?? null,
  };
}
