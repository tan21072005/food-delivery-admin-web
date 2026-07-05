import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadValidationModule() {
  const source = readFileSync("src/lib/validation/sellerApplication.js", "utf8").replaceAll(
    "export function ",
    "function ",
  );
  const sandbox = {};

  vm.runInNewContext(
    `${source}
    globalThis.validationModule = { validateSellerApplicationFields, validateSellerApplicationPayload };`,
    sandbox,
  );

  return sandbox.validationModule;
}

const { validateSellerApplicationFields, validateSellerApplicationPayload } = loadValidationModule();

function validPayload(overrides = {}) {
  return {
    restaurant_name: "Kitchen One",
    owner_name: "Alex Owner",
    email: "owner@example.com",
    phone_number: "0900000000",
    address: "12 Market Street",
    description: "Lunch and dinner service",
    ...overrides,
  };
}

test("accepts valid seller application payloads", () => {
  assert.equal(validateSellerApplicationPayload(validPayload()), null);
});

test("requires core seller application fields", () => {
  const errors = validateSellerApplicationFields(
    validPayload({ restaurant_name: null, owner_name: "", email: null, address: "" }),
  );

  assert.match(errors.restaurant_name, /required/);
  assert.match(errors.owner_name, /required/);
  assert.match(errors.email, /required/);
  assert.match(errors.address, /required/);
});

test("rejects malformed seller application details", () => {
  assert.match(validateSellerApplicationFields(validPayload({ email: "not-email" })).email, /valid email/);
  assert.match(validateSellerApplicationFields(validPayload({ restaurant_name: "x".repeat(121) })).restaurant_name, /120/);
  assert.match(validateSellerApplicationFields(validPayload({ address: "x".repeat(241) })).address, /240/);
  assert.match(validateSellerApplicationFields(validPayload({ description: "x".repeat(1001) })).description, /1000/);
});

test("keeps a single-message seller application validator for server actions", () => {
  assert.match(validateSellerApplicationPayload(validPayload({ email: "not-email" })), /valid email/);
});
