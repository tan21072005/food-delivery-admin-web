export const ROLES = {
  ADMIN: "admin",
  RESTAURANT_OWNER: "restaurant_owner",
  CUSTOMER: "customer",
};

export function getUserRole(user) {
  return user?.app_metadata?.role ?? null;
}

export function getHomePathForRole(role) {
  if (role === ROLES.ADMIN) {
    return "/admin/dashboard";
  }

  if (role === ROLES.RESTAURANT_OWNER) {
    return "/seller/dashboard";
  }

  return "/login";
}

export function canAccessPath(role, pathname) {
  if (pathname.startsWith("/admin")) {
    return role === ROLES.ADMIN;
  }

  if (pathname.startsWith("/seller")) {
    return role === ROLES.RESTAURANT_OWNER;
  }

  return true;
}
