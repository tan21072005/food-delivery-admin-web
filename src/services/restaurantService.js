import { createClient } from "@/lib/supabase/server";

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
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { restaurant: data, error, isConfigured: true };
}
