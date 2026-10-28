import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../dist/app.module.js";
import { configureApp } from "../../dist/configure-app.js";
import { PrismaService } from "../../dist/prisma/prisma.service.js";

function cookieValue(response: {
  headers: Record<string, string | string[] | undefined>;
}): string {
  const setCookie = response.headers["set-cookie"];
  assert.ok(Array.isArray(setCookie) && setCookie.length > 0);
  const cookie = setCookie[0]?.split(";")[0];
  assert.ok(cookie);
  return cookie;
}

function assertDedicatedTestDatabase(): void {
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
}

describe("authentication API", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  before(async () => {
    assertDedicatedTestDatabase();
    process.env.NODE_ENV = "test";
    process.env.CORS_ORIGINS = "http://localhost:3000,http://localhost:3002";
    const nestApp = await NestFactory.create(AppModule, { logger: ["error"] });
    configureApp(nestApp);
    try {
      await nestApp.init();
    } catch (error) {
      await nestApp.close();
      throw error;
    }
    app = nestApp;
    prisma = app.get(PrismaService);
    await prisma.session.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  it("registers an owner transactionally and authenticates only that user", async () => {
    const credentials = {
      email: "Owner@Example.com",
      password: "correct-horse-battery-staple",
      organizationName: "First Rental",
    };
    const register = await request(app.getHttpServer())
      .post("/auth/register")
      .send(credentials);
    assert.equal(register.status, 201, JSON.stringify(register.body));
    const registerCookie = cookieValue(register);
    assert.equal(register.body.email, "owner@example.com");
    assert.equal(register.body.passwordHash, undefined);
    assert.equal(register.body.password, undefined);
    assert.equal(register.body.token, undefined);
    assert.match(register.headers["set-cookie"]?.[0] ?? "", /HttpOnly/i);
    assert.match(register.headers["set-cookie"]?.[0] ?? "", /SameSite=Lax/i);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: credentials.email.toLowerCase() },
      include: { memberships: { include: { organization: true } } },
    });
    assert.equal(user.email, credentials.email.toLowerCase());
    assert.notEqual(user.passwordHash, credentials.password);
    assert.match(user.passwordHash, /^\$argon2id\$/);
    assert.equal(user.memberships.length, 1);
    const membership = user.memberships[0];
    assert.ok(membership);
    assert.equal(membership.role, "OWNER");
    assert.equal(membership.organization.name, credentials.organizationName);

    const session = await prisma.session.findFirstOrThrow({
      where: { userId: user.id },
    });
    assert.notEqual(session.tokenHash, registerCookie.split("=")[1]);

    const duplicate = await request(app.getHttpServer())
      .post("/auth/register")
      .send(credentials);
    assert.equal(duplicate.status, 409);
    assert.doesNotMatch(JSON.stringify(duplicate.body), /owner@example\.com/);

    const me = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", registerCookie);
    assert.equal(me.status, 200);
    assert.equal(me.body.email, credentials.email.toLowerCase());
    assert.equal(me.body.organizations[0].role, "OWNER");
    assert.equal(me.body.passwordHash, undefined);
    assert.equal(me.body.token, undefined);

    const anonymous = await request(app.getHttpServer()).get("/auth/me");
    assert.equal(anonymous.status, 401);

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "OWNER@Example.com", password: credentials.password });
    assert.equal(login.status, 201);
    const loginCookie = cookieValue(login);
    assert.match(login.headers["set-cookie"]?.[0] ?? "", /HttpOnly/i);
    assert.match(login.headers["set-cookie"]?.[0] ?? "", /SameSite=Lax/i);
    assert.equal(login.body.passwordHash, undefined);
    assert.notEqual(loginCookie, registerCookie);

    const loginSession = await prisma.session.findFirstOrThrow({
      where: { userId: user.id, tokenHash: { not: session.tokenHash } },
    });
    assert.notEqual(loginSession.tokenHash, loginCookie.split("=")[1]);
    await request(app.getHttpServer())
      .post("/auth/logout")
      .set("Cookie", loginCookie);

    const logout = await request(app.getHttpServer())
      .post("/auth/logout")
      .set("Cookie", registerCookie);
    assert.equal(logout.status, 204);
    assert.equal(await prisma.session.count({ where: { userId: user.id } }), 0);

    const invalidated = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", registerCookie);
    assert.equal(invalidated.status, 401);
  });

  it("uses generic login errors and rejects invalid input", async () => {
    const invalid = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
        organizationName: "",
      });
    assert.equal(invalid.status, 400, JSON.stringify(invalid.body));

    const absent = await request(app.getHttpServer()).post("/auth/login").send({
      email: "nobody@example.com",
      password: "correct-horse-battery-staple",
    });
    const badPassword = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "owner@example.com", password: "wrong-password" });

    assert.equal(absent.status, 401);
    assert.equal(badPassword.status, 401);
    assert.deepEqual(absent.body, badPassword.body);
    assert.equal(absent.body.token, undefined);
    assert.equal(absent.body.passwordHash, undefined);
  });

  it("sends one-time password reset links and invalidates sessions after reset", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.EMAIL_FROM = "AsteHub <no-reply@example.com>";
    process.env.DASHBOARD_URL = "http://localhost:3000";
    const originalFetch = globalThis.fetch;
    const sentEmails: { body: string }[] = [];
    globalThis.fetch = async (_input, init) => {
      sentEmails.push({ body: String(init?.body) });
      return new Response(JSON.stringify({ id: "test-email" }), {
        status: 200,
      });
    };

    try {
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "owner@example.com",
          password: "correct-horse-battery-staple",
        });
      const sessionCookie = cookieValue(login);

      const requested = await request(app.getHttpServer())
        .post("/auth/password-reset")
        .send({ email: "OWNER@example.com" });
      assert.equal(requested.status, 202);
      assert.deepEqual(requested.body, {
        message:
          "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      });
      assert.equal(sentEmails.length, 1);
      const email = JSON.parse(sentEmails[0]?.body ?? "{}") as {
        to: string[];
        html: string;
      };
      assert.deepEqual(email.to, ["owner@example.com"]);
      const resetUrl = email.html.match(
        /href="(http:\/\/localhost:3000\/reset-password\?token=[^"]+)"/,
      )?.[1];
      assert.ok(resetUrl);
      const resetToken = new URL(resetUrl).searchParams.get("token");
      assert.ok(resetToken);

      const storedToken = await prisma.passwordResetToken.findUniqueOrThrow({
        where: { userId: (await prisma.user.findUniqueOrThrow({
          where: { email: "owner@example.com" },
        })).id },
      });
      assert.notEqual(storedToken.tokenHash, resetToken);
      assert.equal(storedToken.tokenHash.length, 64);

      const cooldownRequest = await request(app.getHttpServer())
        .post("/auth/password-reset")
        .send({ email: "owner@example.com" });
      const unknownRequest = await request(app.getHttpServer())
        .post("/auth/password-reset")
        .send({ email: "unknown@example.com" });
      assert.equal(cooldownRequest.status, unknownRequest.status);
      assert.deepEqual(cooldownRequest.body, unknownRequest.body);
      assert.equal(sentEmails.length, 1);

      const reset = await request(app.getHttpServer())
        .post("/auth/password-reset/confirm")
        .send({ token: resetToken, password: "a-new-secure-password" });
      assert.equal(reset.status, 204);
      assert.equal(
        await prisma.passwordResetToken.count({
          where: { id: storedToken.id },
        }),
        0,
      );
      assert.equal(
        await prisma.session.count({
          where: { user: { email: "owner@example.com" } },
        }),
        0,
      );
      assert.equal(
        (
          await request(app.getHttpServer())
            .get("/auth/me")
            .set("Cookie", sessionCookie)
        ).status,
        401,
      );
      assert.equal(
        (
          await request(app.getHttpServer())
            .post("/auth/password-reset/confirm")
            .send({ token: resetToken, password: "another-secure-password" })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(app.getHttpServer())
            .post("/auth/login")
            .send({
              email: "owner@example.com",
              password: "correct-horse-battery-staple",
            })
        ).status,
        401,
      );
      assert.equal(
        (
          await request(app.getHttpServer())
            .post("/auth/login")
            .send({
              email: "owner@example.com",
              password: "a-new-secure-password",
            })
        ).status,
        201,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("sets credentialed CORS only for configured development origins", async () => {
    const allowed = await request(app.getHttpServer())
      .options("/auth/me")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");
    assert.equal(
      allowed.headers["access-control-allow-origin"],
      "http://localhost:3000",
    );
    assert.equal(allowed.headers["access-control-allow-credentials"], "true");

    const denied = await request(app.getHttpServer())
      .options("/auth/me")
      .set("Origin", "https://untrusted.example")
      .set("Access-Control-Request-Method", "GET");
    assert.equal(denied.headers["access-control-allow-origin"], undefined);
  });

  it("expires sessions and does not expose another user's organizations", async () => {
    const second = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "second@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Second Rental",
      });
    assert.equal(second.status, 201, JSON.stringify(second.body));
    const secondCookie = cookieValue(second);
    const otherUser = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "third@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Third Rental",
      });
    assert.equal(otherUser.status, 201, JSON.stringify(otherUser.body));
    const otherCookie = cookieValue(otherUser);
    const secondMe = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", secondCookie);
    const otherMe = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", otherCookie);
    assert.equal(secondMe.body.email, "second@example.com");
    assert.equal(secondMe.body.organizations[0].name, "Second Rental");
    assert.equal(otherMe.body.email, "third@example.com");
    assert.deepEqual(
      otherMe.body.organizations.map(
        (organization: { name: string }) => organization.name,
      ),
      ["Third Rental"],
    );
    assert.ok(
      secondMe.body.organizations.every(
        (organization: { name: string }) =>
          organization.name !== "Third Rental",
      ),
    );

    const session = await prisma.session.findFirstOrThrow({
      where: { user: { email: "second@example.com" } },
    });
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const expired = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", secondCookie);
    assert.equal(expired.status, 401);
    assert.equal(await prisma.session.count({ where: { id: session.id } }), 0);
  });

  it("manages vehicles with pagination and enforces organization isolation", async () => {
    const firstUser = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "vehicle-owner@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Vehicle Rental A",
      });
    const secondUser = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "another-owner@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Vehicle Rental B",
      });
    const firstCookie = cookieValue(firstUser);
    const secondCookie = cookieValue(secondUser);
    const firstOrg = await prisma.organization.findFirstOrThrow({
      where: { name: "Vehicle Rental A" },
    });
    const secondOrg = await prisma.organization.findFirstOrThrow({
      where: { name: "Vehicle Rental B" },
    });
    const makeVehicle = (cookie: string, organizationId: string, body: object) =>
      request(app.getHttpServer())
        .post(`/vehicles?organizationId=${organizationId}`)
        .set("Cookie", cookie)
        .send(body);

    const firstVehicle = await makeVehicle(firstCookie, firstOrg.id, {
      make: "Toyota",
      model: "Corolla",
      year: 2024,
      description: "Sedan automático",
    });
    assert.equal(firstVehicle.status, 201, JSON.stringify(firstVehicle.body));
    assert.equal(firstVehicle.body.make, "Toyota");
    assert.equal(firstVehicle.body.organizationId, undefined);
    assert.equal(
      (
        await makeVehicle(secondCookie, firstOrg.id, {
          make: "Honda",
          model: "Civic",
          year: 2023,
        })
      ).status,
      403,
    );
    const secondVehicle = await makeVehicle(secondCookie, secondOrg.id, {
      make: "Honda",
      model: "Civic",
      year: 2023,
    });
    assert.equal(secondVehicle.status, 201);
    const crossTenantBulkDelete = await request(app.getHttpServer())
      .delete(`/vehicles/bulk?organizationId=${firstOrg.id}`)
      .set("Cookie", firstCookie)
      .send({ ids: [firstVehicle.body.id, secondVehicle.body.id] });
    assert.equal(crossTenantBulkDelete.status, 404);
    assert.equal(
      await prisma.vehicle.count({
        where: { organizationId: firstOrg.id, id: firstVehicle.body.id },
      }),
      1,
    );

    const createdVehicle = firstVehicle.body as { id: string };
    const fetched = await request(app.getHttpServer())
      .get(`/vehicles/${createdVehicle.id}?organizationId=${firstOrg.id}`)
      .set("Cookie", firstCookie);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.model, "Corolla");

    const crossTenantRead = await request(app.getHttpServer())
      .get(`/vehicles/${createdVehicle.id}?organizationId=${secondOrg.id}`)
      .set("Cookie", secondCookie);
    assert.equal(crossTenantRead.status, 404);

    const list = await request(app.getHttpServer())
      .get(`/vehicles?organizationId=${firstOrg.id}&page=1&limit=1`)
      .set("Cookie", firstCookie);
    assert.equal(list.status, 200);
    assert.equal(list.body.total, 1);
    assert.equal(list.body.page, 1);
    assert.equal(list.body.limit, 1);
    assert.equal(list.body.data.length, 1);

    const updated = await request(app.getHttpServer())
      .patch(`/vehicles/${createdVehicle.id}?organizationId=${firstOrg.id}`)
      .set("Cookie", firstCookie)
      .send({ make: "Toyota", model: "Corolla Cross", year: 2025 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.model, "Corolla Cross");
    assert.equal(updated.body.year, 2025);

    const bulkDelete = await request(app.getHttpServer())
      .delete(`/vehicles/bulk?organizationId=${firstOrg.id}`)
      .set("Cookie", firstCookie)
      .send({ ids: [createdVehicle.id] });
    assert.equal(bulkDelete.status, 200);
    assert.equal(bulkDelete.body.deletedCount, 1);
    assert.equal(
      (
        await request(app.getHttpServer())
          .get(`/vehicles/${createdVehicle.id}?organizationId=${firstOrg.id}`)
          .set("Cookie", firstCookie)
      ).status,
      404,
    );

    const invalidInput = await makeVehicle(firstCookie, firstOrg.id, {
      make: "",
      model: "",
      year: 1800,
    });
    assert.equal(invalidInput.status, 400);
    assert.equal(
      (
        await request(app.getHttpServer())
          .delete(`/vehicles/${secondVehicle.body.id}?organizationId=${firstOrg.id}`)
          .set("Cookie", firstCookie)
      ).status,
      404,
    );
  });

  it("manages vehicle categories with pagination and enforces organization isolation", async () => {
    const firstUser = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "category-owner@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Category Rental A",
      });
    const secondUser = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "another-category-owner@example.com",
        password: "correct-horse-battery-staple",
        organizationName: "Category Rental B",
      });
    const firstCookie = cookieValue(firstUser);
    const secondCookie = cookieValue(secondUser);
    const firstOrg = await prisma.organization.findFirstOrThrow({
      where: { name: "Category Rental A" },
    });
    const secondOrg = await prisma.organization.findFirstOrThrow({
      where: { name: "Category Rental B" },
    });
    const createCategory = (
      cookie: string,
      organizationId: string,
      body: object,
    ) =>
      request(app.getHttpServer())
        .post(`/vehicle-categories?organizationId=${organizationId}`)
        .set("Cookie", cookie)
        .send(body);

    const firstCategory = await createCategory(firstCookie, firstOrg.id, {
      name: "SUV",
      description: "Utilitários esportivos",
    });
    assert.equal(firstCategory.status, 201, JSON.stringify(firstCategory.body));
    assert.equal(firstCategory.body.name, "SUV");
    assert.equal(firstCategory.body.organizationId, undefined);
    assert.equal(
      (
        await createCategory(secondCookie, firstOrg.id, {
          name: "Sedan",
        })
      ).status,
      403,
    );
    const secondCategory = await createCategory(secondCookie, secondOrg.id, {
      name: "SUV",
    });
    assert.equal(secondCategory.status, 201);

    const crossTenantBulkDelete = await request(app.getHttpServer())
      .delete(`/vehicle-categories/bulk?organizationId=${firstOrg.id}`)
      .set("Cookie", firstCookie)
      .send({ ids: [firstCategory.body.id, secondCategory.body.id] });
    assert.equal(crossTenantBulkDelete.status, 404);
    assert.equal(
      await prisma.vehicleCategory.count({
        where: { organizationId: firstOrg.id, id: firstCategory.body.id },
      }),
      1,
    );

    const fetched = await request(app.getHttpServer())
      .get(
        `/vehicle-categories/${firstCategory.body.id}?organizationId=${firstOrg.id}`,
      )
      .set("Cookie", firstCookie);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.name, "SUV");

    const crossTenantRead = await request(app.getHttpServer())
      .get(
        `/vehicle-categories/${firstCategory.body.id}?organizationId=${secondOrg.id}`,
      )
      .set("Cookie", secondCookie);
    assert.equal(crossTenantRead.status, 404);

    const duplicateName = await createCategory(firstCookie, firstOrg.id, {
      name: "SUV",
    });
    assert.equal(duplicateName.status, 409);

    const list = await request(app.getHttpServer())
      .get(
        `/vehicle-categories?organizationId=${firstOrg.id}&page=1&limit=1`,
      )
      .set("Cookie", firstCookie);
    assert.equal(list.status, 200);
    assert.equal(list.body.total, 1);
    assert.equal(list.body.data[0].name, "SUV");

    const updated = await request(app.getHttpServer())
      .patch(
        `/vehicle-categories/${firstCategory.body.id}?organizationId=${firstOrg.id}`,
      )
      .set("Cookie", firstCookie)
      .send({ name: "SUV compacto", description: null });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.name, "SUV compacto");
    assert.equal(updated.body.description, null);

    const deleted = await request(app.getHttpServer())
      .delete(
        `/vehicle-categories/${firstCategory.body.id}?organizationId=${firstOrg.id}`,
      )
      .set("Cookie", firstCookie);
    assert.equal(deleted.status, 204);
    assert.equal(
      (
        await request(app.getHttpServer())
          .get(
            `/vehicle-categories/${firstCategory.body.id}?organizationId=${firstOrg.id}`,
          )
          .set("Cookie", firstCookie)
      ).status,
      404,
    );

    const invalidInput = await createCategory(firstCookie, firstOrg.id, {
      name: " ",
      unexpected: "field",
    });
    assert.equal(invalidInput.status, 400);
  });
});
