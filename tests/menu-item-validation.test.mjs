import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadValidationModule() {
  const source = readFileSync("src/lib/validation/menuItem.js", "utf8")
    .replace("export const MENU_ITEM_STATUS_OPTIONS", "const MENU_ITEM_STATUS_OPTIONS")
    .replace("export const MAX_MENU_IMAGE_SIZE", "const MAX_MENU_IMAGE_SIZE")
    .replace("export const ALLOWED_MENU_IMAGE_TYPES", "const ALLOWED_MENU_IMAGE_TYPES")
    .replaceAll("export function ", "function ");
  const sandbox = { URL };

  vm.runInNewContext(
    `${source}
    globalThis.validationModule = { validateMenuItemFields, validateMenuItemPayload };`,
    sandbox,
  );

  return sandbox.validationModule;
}

const { validateMenuItemFields, validateMenuItemPayload } = loadValidationModule();

function validItem(overrides = {}) {
  return {
    name: "Rice bowl",
    description: "Steamed rice with grilled chicken",
    base_price: 59000,
    image_url: "https://example.com/rice-bowl.jpg",
    image_file: null,
    status: "active",
    ...overrides,
  };
}

test("accepts valid menu item payloads", () => {
  assert.equal(Object.keys(validateMenuItemFields(validItem())).length, 0);
  assert.equal(validateMenuItemPayload(validItem()), null);
});

test("validates menu item required and enum fields", () => {
  const errors = validateMenuItemFields(validItem({ name: "", base_price: -1, status: "archived" }));

  assert.match(errors.name, /required/);
  assert.match(errors.base_price, /0 or greater/);
  assert.match(errors.status, /active, inactive, or sold out/);
});

test("validates menu item text and image URL fields", () => {
  assert.match(validateMenuItemFields(validItem({ name: "x".repeat(121) })).name, /120/);
  assert.match(validateMenuItemFields(validItem({ description: "x".repeat(1001) })).description, /1000/);
  assert.match(validateMenuItemFields(validItem({ image_url: "ftp://example.com/image.jpg" })).image_url, /http/);
  assert.match(validateMenuItemFields(validItem({ image_url: "not-a-url" })).image_url, /http/);
});

test("validates menu item image uploads", () => {
  assert.match(
    validateMenuItemFields(validItem({ image_file: { size: 10, type: "image/gif" } })).image_file,
    /JPEG, PNG, or WebP/,
  );
  assert.match(
    validateMenuItemFields(validItem({ image_file: { size: 6 * 1024 * 1024, type: "image/png" } })).image_file,
    /5MB/,
  );
});
