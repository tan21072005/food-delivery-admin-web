import { createClient } from "@/lib/supabase/server";

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
    .select("id, name")
    .eq("owner_user_id", appUser.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { restaurant: data, error, isConfigured: true };
}
