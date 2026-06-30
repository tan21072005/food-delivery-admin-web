"use client";

import { createClient } from "@/lib/supabase/browser";

const restaurantColumns = `
  id,
  name,
  description,
  phone_number,
  address,
  logo_url,
  avg_rating,
  total_reviews,
  is_open,
  status,
  created_at,
  owner:users!restaurants_owner_user_id_fkey (
    id,
    full_name,
    email
  ),
  cuisine:cuisines (
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

export async function listRestaurants() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select(restaurantColumns)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function updateRestaurant(restaurantId, values) {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult(null);
  }

  const payload = {
    name: values.name,
    description: values.description || null,
    phone_number: values.phone_number || null,
    address: values.address,
    is_open: Boolean(values.is_open),
    status: values.status,
  };

  const { data, error } = await supabase
    .from("restaurants")
    .update(payload)
    .eq("id", restaurantId)
    .select(restaurantColumns)
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}
