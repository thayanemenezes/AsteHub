import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "../../../api/dist/app.module.js";
import { configureApp } from "../../../api/dist/configure-app.js";
import { AuthApi } from "../../src/auth/auth-api.js";

describe("web authentication client with the real API and PostgreSQL", () => {
  let app: INestApplication;
  let api: AuthApi;
  let cookie: string | undefined;

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must point to the dedicated astehub_test database.",
      );
    }
    const databaseName = decodeURIComponent(
      new URL(connectionString).pathname.slice(1),
    );
    if (databaseName !== "astehub_test") {
      throw new Error(
        "Integration tests may only use the dedicated astehub_test database.",
      );
    }

    process.env.CORS_ORIGINS = "http://localhost:3000";
    const nestApp = await NestFactory.create(AppModule, { logger: false });
    configureApp(nestApp);
    await nestApp.listen(0, "127.0.0.1");
    app = nestApp;
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    api = new AuthApi(
      `http://127.0.0.1:${address.port}`,
      async (input, init) => {
        expect(init?.credentials).toBe("include");
        const headers = new Headers(init?.headers);
        if (cookie) {
          headers.set("Cookie", cookie);
        }
        const response = await fetch(input, { ...init, headers });
        const setCookie = response.headers.getSetCookie()[0];
        if (setCookie) {
          cookie = setCookie.split(";")[0];
        }
        return response;
      },
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("registers, loads, logs into, and invalidates a cookie session", async () => {
    const email = `web-${randomUUID()}@example.com`;
    const credentials = {
      email,
      password: "correct-horse-battery-staple",
      organizationName: "Locadora de Integracao",
    };

    const registered = await api.register(credentials);
    expect(registered.email).toBe(email);
    expect("passwordHash" in registered).toBe(false);
    expect("token" in registered).toBe(false);
    expect(cookie).toMatch(/^astehub_session=/);

    const currentUser = await api.getCurrentUser();
    expect(currentUser?.email).toBe(email);
    expect(currentUser?.organizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: credentials.organizationName }),
      ]),
    );
    expect(currentUser && "passwordHash" in currentUser).toBe(false);
    expect(currentUser && "token" in currentUser).toBe(false);

    await api.logout();
    expect(await api.getCurrentUser()).toBeNull();

    await expect(
      api.login({ email, password: "wrong-password-long-enough" }),
    ).rejects.toMatchObject({ status: 401 });
    const loggedIn = await api.login({
      email: credentials.email,
      password: credentials.password,
    });
    expect(loggedIn.email).toBe(email);
    expect(await api.getCurrentUser()).toMatchObject({ email });
    await api.logout();
    expect(await api.getCurrentUser()).toBeNull();
  });
});
