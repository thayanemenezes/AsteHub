import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearSessionCookieOptions,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "../../src/auth/auth-session.js";

describe("session cookie configuration", () => {
  it("uses secure, scoped cookie options in production", () => {
    const previousEnvironment = process.env.NODE_ENV;
    const previousDomain = process.env.COOKIE_DOMAIN;

    try {
      process.env.NODE_ENV = "production";
      process.env.COOKIE_DOMAIN = ".astehub.example";

      const options = sessionCookieOptions();
      assert.equal(options.httpOnly, true);
      assert.equal(options.secure, true);
      assert.equal(options.sameSite, "lax");
      assert.equal(options.path, "/");
      assert.equal(options.domain, ".astehub.example");
      assert.equal(options.maxAge, SESSION_TTL_MS);
      assert.equal(clearSessionCookieOptions().maxAge, undefined);
    } finally {
      if (previousEnvironment === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousEnvironment;
      }
      if (previousDomain === undefined) {
        delete process.env.COOKIE_DOMAIN;
      } else {
        process.env.COOKIE_DOMAIN = previousDomain;
      }
    }
  });
});
