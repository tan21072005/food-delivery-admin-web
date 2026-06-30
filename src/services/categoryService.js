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

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
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

  const { data, error } = await supabase
    .from("dish_categories")
    .insert({
      restaurant_id: Number(values.restaurant_id),
      name: values.name,
      slug: values.slug,
      sort_order: Number(values.sort_order || 0),
      status: values.status,
    })
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

  const { data, error } = await supabase
    .from("dish_categories")
    .update({
      restaurant_id: Number(values.restaurant_id),
      name: values.name,
      slug: values.slug,
      sort_order: Number(values.sort_order || 0),
      status: values.status,
    })
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