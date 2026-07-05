import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadRolesModule() {
  const source = readFileSync("src/lib/auth/roles.js", "utf8")
    .replace("export const ROLES", "const ROLES")
    .replaceAll("export function ", "function ");
  const sandbox = {};

  vm.runInNewContext(
    `${source}
    globalThis.rolesModule = { ROLES, getUserRole, getHomePathForRole, isPublicAppPath, canAccessPath };`,
    sandbox,
  );

  return sandbox.rolesModule;
}

const { ROLES, getUserRole, getHomePathForRole, isPublicAppPath, canAccessPath } = loadRolesModule();

test("reads role from Supabase app metadata", () => {
  assert.equal(getUserRole({ app_metadata: { role: ROLES.ADMIN } }), ROLES.ADMIN);
  assert.equal(getUserRole({ app_metadata: { role: ROLES.RESTAURANT_OWNER } }), ROLES.RESTAURANT_OWNER);
  assert.equal(getUserRole({}), null);
});

test("maps allowed roles to their dashboard home", () => {
  assert.equal(getHomePathForRole(ROLES.ADMIN), "/admin/dashboard");
  assert.equal(getHomePathForRole(ROLES.RESTAURANT_OWNER), "/seller/dashboard");
  assert.equal(getHomePathForRole(ROLES.CUSTOMER), "/login");
  assert.equal(getHomePathForRole(null), "/login");
});

test("guards admin and seller route families by role", () => {
  assert.equal(canAccessPath(ROLES.ADMIN, "/admin/orders"), true);
  assert.equal(canAccessPath(ROLES.ADMIN, "/seller/orders"), false);
  assert.equal(canAccessPath(ROLES.RESTAURANT_OWNER, "/seller/orders"), true);
  assert.equal(canAccessPath(ROLES.RESTAURANT_OWNER, "/admin/users"), false);
  assert.equal(canAccessPath(ROLES.CUSTOMER, "/login"), true);
});

test("keeps seller application intake public without opening seller workspace routes", () => {
  assert.equal(isPublicAppPath("/seller/apply"), true);
  assert.equal(canAccessPath(null, "/seller/apply"), true);
  assert.equal(canAccessPath(ROLES.CUSTOMER, "/seller/apply"), true);
  assert.equal(isPublicAppPath("/seller/orders"), false);
  assert.equal(canAccessPath(null, "/seller/orders"), false);
});
