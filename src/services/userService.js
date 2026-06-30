"use client";

import { createClient } from "@/lib/supabase/browser";

const userColumns = "id, full_name, email, phone_number, role, status, created_at, updated_at";

function missingConfigResult(data) {
  return {
    data,
    error: "Supabase environment variables are not configured.",
  };
}

export async function listUsers() {
  const supabase = createClient();

  if (!supabase) {
    return missingConfigResult([]);
  }

  const { data, error } = await supabase
    .from("users")
    .select(userColumns)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}