import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadValidationModule() {
  const source = readFileSync("src/lib/validation/offer.js", "utf8")
    .replace("export const VALID_OFFER_DISCOUNT_TYPES", "const VALID_OFFER_DISCOUNT_TYPES")
    .replace("export const VALID_OFFER_STATUSES", "const VALID_OFFER_STATUSES")
    .replaceAll("export function ", "function ");
  const sandbox = {};

  vm.runInNewContext(
    `${source}
    globalThis.validationModule = { validateOfferFields, validateOfferPayload };`,
    sandbox,
  );

  return sandbox.validationModule;
}

const { validateOfferFields, validateOfferPayload } = loadValidationModule();

function validOffer(overrides = {}) {
  return {
    title: "Lunch deal",
    discount_type: "percent",
    discount_value: 15,
    min_order_amount: 0,
    starts_at: "2026-07-01T09:00:00.000Z",
    ends_at: "2026-07-01T12:00:00.000Z",
    status: "active",
    ...overrides,
  };
}

test("accepts valid offer payloads", () => {
  assert.equal(Object.keys(validateOfferFields(validOffer())).length, 0);
  assert.equal(validateOfferPayload(validOffer()), null);
});

test("returns field-level errors for required offer fields and enums", () => {
  const errors = validateOfferFields(
    validOffer({
      title: "",
      discount_type: "bogus",
      status: "archived",
    }),
  );

  assert.match(errors.title, /required/);
  assert.match(errors.discount_type, /percent or fixed/);
  assert.match(errors.status, /active or inactive/);
});

test("validates offer numeric discount and minimum order rules", () => {
  assert.match(validateOfferFields(validOffer({ discount_value: 0 })).discount_value, /greater than 0/);
  assert.match(validateOfferFields(validOffer({ discount_value: 101 })).discount_value, /cannot exceed 100/);
  assert.match(validateOfferFields(validOffer({ min_order_amount: -1 })).min_order_amount, /0 or greater/);
});

test("validates offer date order and malformed dates", () => {
  assert.match(validateOfferFields(validOffer({ starts_at: "bad-date" })).starts_at, /invalid/);
  assert.match(validateOfferFields(validOffer({ ends_at: "bad-date" })).ends_at, /invalid/);
  assert.match(
    validateOfferFields(
      validOffer({
        starts_at: "2026-07-01T12:00:00.000Z",
        ends_at: "2026-07-01T09:00:00.000Z",
      }),
    ).ends_at,
    /after start/,
  );
});
