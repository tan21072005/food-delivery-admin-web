import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES, getUserRole } from "@/lib/auth/roles";
import { validateSellerApplicationPayload } from "@/lib/validation/sellerApplication";

export const SELLER_APPLICATION_STATUSES = ["pending", "approved", "rejected"];
const DEFAULT_PAGE_SIZE = 10;

const applicationColumns = `
  id,
  restaurant_name,
  owner_name,
  email,
  phone_number,
  address,
  description,
  status,
  admin_note,
  restaurant_id,
  reviewed_at,
  created_at,
  restaurant:restaurants!seller_applications_restaurant_id_fkey (
    id,
    name,
    status
  ),
  reviewer:users!seller_applications_reviewed_by_user_id_fkey (
    id,
    full_name,
    email
  )
`;

function cleanText(value) {
  const text = value?.toString().trim();
  return text || null;
}

function cleanEmail(value) {
  const email = cleanText(value)?.toLowerCase();
  return email || null;
}

function cleanStatus(value) {
  const status = cleanText(value);
  return SELLER_APPLICATION_STATUSES.includes(status) ? status : "all";
}

function getPageRange(page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1, page: safePage, pageSize: safePageSize };
}

function buildApplicationPayload(formData) {
  return {
    restaurant_name: cleanText(formData.get("restaurant_name")),
    owner_name: cleanText(formData.get("owner_name")),
    email: cleanEmail(formData.get("email")),
    phone_number: cleanText(formData.get("phone_number")),
    address: cleanText(formData.get("address")),
    description: cleanText(formData.get("description")),
    status: "pending",
  };
}

async function getAdminContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, appUser: null, error: null, isConfigured: false };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { supabase, appUser: null, error: authError, isConfigured: true };
  }

  if (getUserRole(user) !== ROLES.ADMIN) {
    return { supabase, appUser: null, error: new Error("Admin access is required."), isConfigured: true };
  }

  const { data: appUser, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_uid", user.id)
    .maybeSingle();

  if (profileError) {
    return { supabase, appUser: null, error: profileError, isConfigured: true };
  }

  return { supabase, appUser, error: null, isConfigured: true };
}

async function findAuthUserByEmail(adminSupabase, email) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 100 });

    if (error) {
      return { user: null, error };
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (user) {
      return { user, error: null };
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return { user: null, error: null };
}

async function getOrInviteSellerAuthUser(adminSupabase, application) {
  const { user: existingUser, error: lookupError } = await findAuthUserByEmail(adminSupabase, application.email);

  if (lookupError) {
    return { user: null, error: lookupError };
  }

  if (existingUser) {
    return { user: existingUser, error: null };
  }

  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(application.email, {
    data: {
      full_name: application.owner_name,
      phone_number: application.phone_number,
    },
  });

  return { user: data?.user ?? null, error };
}

async function provisionSellerFromApplication(application) {
  const adminSupabase = createAdminClient();

  if (!adminSupabase) {
    return {
      ok: false,
      message: "Seller approval requires NEXT_SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const { user: authUser, error: authError } = await getOrInviteSellerAuthUser(adminSupabase, application);

  if (authError || !authUser) {
    return { ok: false, message: authError?.message ?? "Could not create or find seller auth user." };
  }

  const { error: roleError } = await adminSupabase.auth.admin.updateUserById(authUser.id, {
    app_metadata: {
      ...(authUser.app_metadata ?? {}),
      role: ROLES.RESTAURANT_OWNER,
    },
    user_metadata: {
      ...(authUser.user_metadata ?? {}),
      full_name: application.owner_name,
      phone_number: application.phone_number,
    },
  });

  if (roleError) {
    return { ok: false, message: roleError.message };
  }

  const { data: appUser, error: profileError } = await adminSupabase
    .from("users")
    .upsert(
      {
        auth_uid: authUser.id,
        role: ROLES.RESTAURANT_OWNER,
        full_name: application.owner_name,
        phone_number: application.phone_number,
        email: application.email,
        status: "active",
      },
      { onConflict: "auth_uid" },
    )
    .select("id")
    .single();

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  const { data: restaurant, error: restaurantError } = await adminSupabase
    .from("restaurants")
    .upsert(
      {
        owner_user_id: appUser.id,
        name: application.restaurant_name,
        description: application.description,
        phone_number: application.phone_number,
        address: application.address,
        is_open: false,
        status: "active",
      },
      { onConflict: "owner_user_id,name" },
    )
    .select("id")
    .single();

  if (restaurantError) {
    return { ok: false, message: restaurantError.message };
  }

  return { ok: true, authUser, appUser, restaurant };
}

export async function submitSellerApplication(formData) {
  const supabase = await createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const payload = buildApplicationPayload(formData);
  const validationError = validateSellerApplicationPayload(payload);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const { error } = await supabase.from("seller_applications").insert(payload);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Application submitted for review." };
}

export async function listSellerApplications({ page = 1, pageSize = DEFAULT_PAGE_SIZE, status = "pending" } = {}) {
  const { supabase, error, isConfigured } = await getAdminContext();

  if (!isConfigured || error) {
    return { applications: [], count: 0, page, pageSize, status, error, isConfigured };
  }

  const range = getPageRange(page, pageSize);
  const safeStatus = cleanStatus(status);
  let request = supabase
    .from("seller_applications")
    .select(applicationColumns, { count: "exact" })
    .order("created_at", { ascending: false });

  if (safeStatus !== "all") {
    request = request.eq("status", safeStatus);
  }

  const { data, error: listError, count } = await request.range(range.from, range.to);

  return {
    applications: data ?? [],
    count: count ?? 0,
    page: range.page,
    pageSize: range.pageSize,
    status: safeStatus,
    error: listError,
    isConfigured,
  };
}

export async function reviewSellerApplication(formData) {
  const { supabase, appUser, error, isConfigured } = await getAdminContext();

  if (!isConfigured) return { ok: false, message: "Supabase is not configured." };
  if (error) return { ok: false, message: error.message };
  if (!appUser) return { ok: false, message: "Admin profile was not found." };

  const id = cleanText(formData.get("id"));
  const status = cleanText(formData.get("status"));
  const adminNote = cleanText(formData.get("admin_note"));

  if (!id) {
    return { ok: false, message: "Application id is required." };
  }

  if (!["approved", "rejected"].includes(status)) {
    return { ok: false, message: "Application can only be approved or rejected." };
  }

  const { data: application, error: applicationError } = await supabase
    .from("seller_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (applicationError) {
    return { ok: false, message: applicationError.message };
  }

  if (application.status !== "pending") {
    return { ok: false, message: "Application was already reviewed." };
  }

  let restaurantId = null;

  if (status === "approved") {
    const provisioningResult = await provisionSellerFromApplication(application);

    if (!provisioningResult.ok) {
      return provisioningResult;
    }

    restaurantId = provisioningResult.restaurant.id;
  }

  const { error: updateError } = await supabase
    .from("seller_applications")
    .update({
      status,
      admin_note: adminNote,
      restaurant_id: restaurantId,
      reviewed_by_user_id: appUser.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  return updateError
    ? { ok: false, message: updateError.message }
    : { ok: true, message: `Application ${status}.` };
}
