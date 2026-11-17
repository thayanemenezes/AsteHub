import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PublicLeadRateLimiter } from "../../src/public/public-lead-rate-limiter.js";

test("limits repeated lead submissions per IP and tenant within a window", () => {
  const limiter = new PublicLeadRateLimiter();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    limiter.assertAllowed("127.0.0.1", "rental-a", 1_000);
  }
  assert.throws(
    () => limiter.assertAllowed("127.0.0.1", "rental-a", 1_001),
    (error: unknown) =>
      error instanceof HttpException &&
      error.getStatus() === HttpStatus.TOO_MANY_REQUESTS,
  );
  assert.doesNotThrow(() =>
    limiter.assertAllowed("127.0.0.1", "rental-b", 1_001),
  );
  assert.doesNotThrow(() =>
    limiter.assertAllowed("127.0.0.1", "rental-a", 601_001),
  );
});
