import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "../../src/auth/auth-crypto.js";

describe("authentication cryptography", () => {
  it("normalizes email addresses consistently", () => {
    assert.equal(normalizeEmail("  Alice@Example.COM "), "alice@example.com");
  });

  it("stores passwords as Argon2id hashes and verifies them", async () => {
    const hash = await hashPassword("a-long-password");

    assert.notEqual(hash, "a-long-password");
    assert.match(hash, /^\$argon2id\$/);
    assert.equal(await verifyPassword(hash, "a-long-password"), true);
    assert.equal(await verifyPassword(hash, "wrong-password"), false);
  });
});
