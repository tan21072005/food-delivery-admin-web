import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadValidationModule() {
  const source = readFileSync("src/lib/validation/signup.js", "utf8").replaceAll("export function ", "function ");
  const sandbox = {};

  vm.runInNewContext(
    `${source}
    globalThis.validationModule = { validateSignupFields, validateSignup };`,
    sandbox,
  );

  return sandbox.validationModule;
}

const { validateSignupFields, validateSignup } = loadValidationModule();

test("accepts valid signup fields", () => {
  assert.equal(
    Object.keys(validateSignupFields({ fullName: "Customer One", email: "customer@example.com", password: "secret123" }))
      .length,
    0,
  );
  assert.equal(validateSignup({ fullName: "Customer One", email: "customer@example.com", password: "secret123" }), null);
});

test("returns field-level signup errors", () => {
  const errors = validateSignupFields({ fullName: "", email: "bad-email", password: "short" });

  assert.match(errors.fullName, /required/);
  assert.match(errors.email, /valid email/);
  assert.match(errors.password, /at least 8/);
});
