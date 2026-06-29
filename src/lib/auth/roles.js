export const ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  RESTAURANT: "restaurant",
  CUSTOMER: "customer",
};

export function getUserRole(user) {
  return user?.app_metadata?.role ?? null;
}

export function getHomePathForRole(role) {
  if (role === ROLES.ADMIN) {
    return "/admin/dashboard";
  }

  if (role === ROLES.SELLER || role === ROLES.RESTAURANT) {
    return "/seller/dashboard";
  }

  return "/login";
}

export function canAccessPath(role, pathname) {
  if (pathname.startsWith("/admin")) {
    return role === ROLES.ADMIN;
  }

  if (pathname.startsWith("/seller")) {
    return role === ROLES.SELLER || role === ROLES.RESTAURANT;
  }

  return true;
}
