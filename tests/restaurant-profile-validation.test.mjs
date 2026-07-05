import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadValidationModule() {
  const menuSource = readFileSync("src/lib/validation/menuItem.js", "utf8")
    .replace("export const MENU_ITEM_STATUS_OPTIONS", "const MENU_ITEM_STATUS_OPTIONS")
    .replace("export const MAX_MENU_IMAGE_SIZE", "const MAX_MENU_IMAGE_SIZE")
    .replace("export const ALLOWED_MENU_IMAGE_TYPES", "const ALLOWED_MENU_IMAGE_TYPES")
    .replaceAll("export function ", "function ");
  const restaurantSource = readFileSync("src/lib/validation/restaurantProfile.js", "utf8")
    .replace('import { ALLOWED_MENU_IMAGE_TYPES, MAX_MENU_IMAGE_SIZE } from "@/lib/validation/menuItem";', "")
    .replaceAll("export function ", "function ");
  const sandbox = { URL };

  vm.runInNewContext(
    `${menuSource}
    ${restaurantSource}
    globalThis.validationModule = { validateRestaurantProfileFields, validateRestaurantProfilePayload };`,
    sandbox,
  );

  return sandbox.validationModule;
}

const { validateRestaurantProfileFields, validateRestaurantProfilePayload } = loadValidationModule();

function validProfile(overrides = {}) {
  return {
    name: "Kitchen One",
    description: "Fresh lunch and dinner",
    address_detail: "12 Market Street",
    locality: "District 1, Ho Chi Minh City",
    logo_url: "https://example.com/logo.png",
    cover_url: "https://example.com/cover.png",
    logo_file: null,
    cover_file: null,
    ...overrides,
  };
}

test("accepts valid restaurant profile payloads", () => {
  assert.equal(Object.keys(validateRestaurantProfileFields(validProfile())).length, 0);
  assert.equal(validateRestaurantProfilePayload(validProfile()), null);
});

test("validates restaurant profile required and length fields", () => {
  const errors = validateRestaurantProfileFields(
    validProfile({ name: "", description: "x".repeat(1001), address_detail: "", locality: "" }),
  );

  assert.match(errors.name, /required/);
  assert.match(errors.description, /1000/);
  assert.match(errors.address_detail, /required/);
});

test("validates restaurant profile urls and image uploads", () => {
  assert.match(validateRestaurantProfileFields(validProfile({ logo_url: "ftp://example.com/logo.png" })).logo_url, /http/);
  assert.match(validateRestaurantProfileFields(validProfile({ cover_url: "not-url" })).cover_url, /http/);
  assert.match(
    validateRestaurantProfileFields(validProfile({ logo_file: { size: 10, type: "image/gif" } })).logo_file,
    /JPEG, PNG, or WebP/,
  );
  assert.match(
    validateRestaurantProfileFields(validProfile({ cover_file: { size: 6 * 1024 * 1024, type: "image/png" } })).cover_file,
    /5MB/,
  );
});
