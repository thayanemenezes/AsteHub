import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PasswordResetEmailService } from "../../src/auth/password-reset-email.service.js";

describe("password reset email delivery", () => {
  it("includes the Resend rejection reason in the API error", async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.RESEND_API_KEY;
    const originalSender = process.env.EMAIL_FROM;
    const originalDashboardUrl = process.env.DASHBOARD_URL;
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "AsteHub <no-reply@example.com>";
    process.env.DASHBOARD_URL = "http://localhost:3000";
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          message: "The domain is not verified",
        }),
        { status: 403 },
      );

    try {
      await assert.rejects(
        new PasswordResetEmailService().send(
          "user@example.com",
          "one-time-token",
        ),
        /Resend returned HTTP 403: The domain is not verified/,
      );
    } finally {
      globalThis.fetch = originalFetch;
      if (originalApiKey === undefined) {
        delete process.env.RESEND_API_KEY;
      } else {
        process.env.RESEND_API_KEY = originalApiKey;
      }
      if (originalSender === undefined) {
        delete process.env.EMAIL_FROM;
      } else {
        process.env.EMAIL_FROM = originalSender;
      }
      if (originalDashboardUrl === undefined) {
        delete process.env.DASHBOARD_URL;
      } else {
        process.env.DASHBOARD_URL = originalDashboardUrl;
      }
    }
  });
});
