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

describe("public site API", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let originalBaseDomain: string | undefined;

  before(async () => {
    assertDedicatedTestDatabase();
    process.env.NODE_ENV = "test";
    process.env.CORS_ORIGINS = "http://localhost:3000";
    originalBaseDomain = process.env.PUBLIC_BASE_DOMAIN;
    process.env.PUBLIC_BASE_DOMAIN = "astehub.test";

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
  });

  after(async () => {
    if (app) {
      await app.close();
    }
    if (originalBaseDomain === undefined) {
      delete process.env.PUBLIC_BASE_DOMAIN;
    } else {
      process.env.PUBLIC_BASE_DOMAIN = originalBaseDomain;
    }
  });

  it("resolves each tenant and exposes only published site, catalog and locations", async () => {
    const suffix = Date.now().toString();
    const registrations = await Promise.all([
      request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: `public-a-${suffix}@example.com`,
          password: "correct-horse-battery-staple",
          organizationName: `Public Rental A ${suffix}`,
        }),
      request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: `public-b-${suffix}@example.com`,
          password: "correct-horse-battery-staple",
          organizationName: `Public Rental B ${suffix}`,
        }),
    ]);
    assert.equal(registrations[0]?.status, 201);
    assert.equal(registrations[1]?.status, 201);
    const firstCookie = cookieValue(registrations[0]!);
    const secondCookie = cookieValue(registrations[1]!);
    const [firstOrganization, secondOrganization] = await Promise.all([
      prisma.organization.findFirstOrThrow({
        where: { name: `Public Rental A ${suffix}` },
      }),
      prisma.organization.findFirstOrThrow({
        where: { name: `Public Rental B ${suffix}` },
      }),
    ]);
    const firstSlug = `public-rental-a-${suffix}`;
    const secondSlug = `public-rental-b-${suffix}`;

    const [firstSite, secondSite] = await Promise.all([
      request(app.getHttpServer())
        .post(`/sites?organizationId=${firstOrganization.id}`)
        .set("Cookie", firstCookie)
        .send({
          publicName: `Public Locadora A ${suffix}`,
          slug: firstSlug,
          isPublished: true,
        }),
      request(app.getHttpServer())
        .post(`/sites?organizationId=${secondOrganization.id}`)
        .set("Cookie", secondCookie)
        .send({
          publicName: `Public Locadora B ${suffix}`,
          slug: secondSlug,
          isPublished: true,
        }),
    ]);
    assert.equal(firstSite.status, 201, JSON.stringify(firstSite.body));
    assert.equal(secondSite.status, 201, JSON.stringify(secondSite.body));

    const [firstCategory, secondCategory] = await Promise.all([
      prisma.vehicleCategory.create({
        data: {
          organizationId: firstOrganization.id,
          name: `SUV A ${suffix}`,
        },
      }),
      prisma.vehicleCategory.create({
        data: {
          organizationId: secondOrganization.id,
          name: `SUV B ${suffix}`,
        },
      }),
    ]);
    const [firstVehicle, unpublishedVehicle, secondVehicle] =
      await Promise.all([
        request(app.getHttpServer())
          .post(`/vehicles?organizationId=${firstOrganization.id}`)
          .set("Cookie", firstCookie)
          .send({
            make: "Toyota",
            model: `Corolla A ${suffix}`,
            year: 2025,
            description: "Veículo público para locação.",
            images: ["https://images.example.com/public-a.jpg"],
            categoryId: firstCategory.id,
            isPublished: true,
          }),
        request(app.getHttpServer())
          .post(`/vehicles?organizationId=${firstOrganization.id}`)
          .set("Cookie", firstCookie)
          .send({
            make: "Honda",
            model: `Civic Draft ${suffix}`,
            year: 2025,
            categoryId: firstCategory.id,
          }),
        request(app.getHttpServer())
          .post(`/vehicles?organizationId=${secondOrganization.id}`)
          .set("Cookie", secondCookie)
          .send({
            make: "Fiat",
            model: `Pulse B ${suffix}`,
            year: 2025,
            categoryId: secondCategory.id,
            isPublished: true,
          }),
      ]);
    assert.equal(firstVehicle.status, 201, JSON.stringify(firstVehicle.body));
    assert.equal(unpublishedVehicle.status, 201);
    assert.equal(secondVehicle.status, 201);

    const [firstLocation, unpublishedLocation, secondLocation] =
      await Promise.all([
        request(app.getHttpServer())
          .post(`/locations?organizationId=${firstOrganization.id}`)
          .set("Cookie", firstCookie)
          .send({
            name: `Unidade A ${suffix}`,
            address: "Rua Um, 10",
            city: "São Paulo",
            state: "SP",
            phone: "1133334444",
            managerName: "Internal Manager",
            isPublished: true,
          }),
        request(app.getHttpServer())
          .post(`/locations?organizationId=${firstOrganization.id}`)
          .set("Cookie", firstCookie)
          .send({
            name: `Unidade A Draft ${suffix}`,
            address: "Rua Dois, 20",
            city: "São Paulo",
            state: "SP",
          }),
        request(app.getHttpServer())
          .post(`/locations?organizationId=${secondOrganization.id}`)
          .set("Cookie", secondCookie)
          .send({
            name: `Unidade B ${suffix}`,
            address: "Rua Três, 30",
            city: "Curitiba",
            state: "PR",
            isPublished: true,
          }),
      ]);
    assert.equal(firstLocation.status, 201);
    assert.equal(unpublishedLocation.status, 201);
    assert.equal(secondLocation.status, 201);

    const publicSite = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/site`,
    );
    assert.equal(publicSite.status, 200, JSON.stringify(publicSite.body));
    assert.equal(publicSite.body.publicName, `Public Locadora A ${suffix}`);
    assert.equal(publicSite.body.organizationId, undefined);
    assert.equal(publicSite.body.isPublished, undefined);

    const subdomainSite = await request(app.getHttpServer()).get(
      `/public/${firstSlug}.astehub.test/site`,
    );
    assert.equal(subdomainSite.status, 200);
    assert.equal(subdomainSite.body.slug, firstSlug);

    const publicVehicles = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/vehicles?page=1&limit=10`,
    );
    assert.equal(publicVehicles.status, 200);
    assert.equal(publicVehicles.body.total, 1);
    assert.equal(publicVehicles.body.data[0]?.id, firstVehicle.body.id);
    assert.equal(publicVehicles.body.data[0]?.organizationId, undefined);
    assert.equal(publicVehicles.body.data[0]?.customFields, undefined);

    const publicVehicle = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/vehicles/${firstVehicle.body.id}`,
    );
    assert.equal(publicVehicle.status, 200);
    assert.equal(publicVehicle.body.model, `Corolla A ${suffix}`);

    const foreignVehicle = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/vehicles/${secondVehicle.body.id}`,
    );
    assert.equal(foreignVehicle.status, 404);
    const draftVehicle = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/vehicles/${unpublishedVehicle.body.id}`,
    );
    assert.equal(draftVehicle.status, 404);

    const publicCategories = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/categories`,
    );
    assert.equal(publicCategories.status, 200);
    assert.deepEqual(
      publicCategories.body.map((category: { id: string }) => category.id),
      [firstCategory.id],
    );

    const publicLocations = await request(app.getHttpServer()).get(
      `/public/${firstSlug}/locations`,
    );
    assert.equal(publicLocations.status, 200);
    assert.equal(publicLocations.body.total, 1);
    assert.equal(publicLocations.body.data[0]?.id, firstLocation.body.id);
    assert.equal(publicLocations.body.data[0]?.managerName, undefined);
    assert.equal(publicLocations.body.data[0]?.organizationId, undefined);
    assert.notEqual(
      publicLocations.body.data[0]?.id,
      unpublishedLocation.body.id,
    );

    const unauthenticatedAdminList = await request(app.getHttpServer()).get(
      `/vehicles?organizationId=${firstOrganization.id}`,
    );
    assert.equal(unauthenticatedAdminList.status, 401);
  });

  it("creates public leads for one tenant and rejects cross-tenant references", async () => {
    const suffix = Date.now().toString();
    const registration = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: `lead-a-${suffix}@example.com`,
        password: "correct-horse-battery-staple",
        organizationName: `Lead Rental A ${suffix}`,
      });
    const firstCookie = cookieValue(registration);
    const firstOrganization = await prisma.organization.findFirstOrThrow({
      where: { name: `Lead Rental A ${suffix}` },
    });
    const secondRegistration = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: `lead-b-${suffix}@example.com`,
        password: "correct-horse-battery-staple",
        organizationName: `Lead Rental B ${suffix}`,
      });
    const secondCookie = cookieValue(secondRegistration);
    const secondOrganization = await prisma.organization.findFirstOrThrow({
      where: { name: `Lead Rental B ${suffix}` },
    });
    const firstSlug = `lead-rental-a-${suffix}`;
    const firstSite = await request(app.getHttpServer())
      .post(`/sites?organizationId=${firstOrganization.id}`)
      .set("Cookie", firstCookie)
      .send({
        publicName: `Lead Locadora A ${suffix}`,
        slug: firstSlug,
        isPublished: true,
      });
    assert.equal(firstSite.status, 201, JSON.stringify(firstSite.body));
    const secondSite = await request(app.getHttpServer())
      .post(`/sites?organizationId=${secondOrganization.id}`)
      .set("Cookie", secondCookie)
      .send({
        publicName: `Lead Locadora B ${suffix}`,
        slug: `lead-rental-b-${suffix}`,
        isPublished: true,
      });
    assert.equal(secondSite.status, 201);
    const firstVehicle = await request(app.getHttpServer())
      .post(`/vehicles?organizationId=${firstOrganization.id}`)
      .set("Cookie", firstCookie)
      .send({
        make: "Toyota",
        model: `Corolla ${suffix}`,
        year: 2025,
        isPublished: true,
      });
    const secondVehicle = await request(app.getHttpServer())
      .post(`/vehicles?organizationId=${secondOrganization.id}`)
      .set("Cookie", secondCookie)
      .send({
        make: "Honda",
        model: `Civic ${suffix}`,
        year: 2025,
        isPublished: true,
      });
    const firstLocation = await request(app.getHttpServer())
      .post(`/locations?organizationId=${firstOrganization.id}`)
      .set("Cookie", firstCookie)
      .send({
        name: `Unidade Lead A ${suffix}`,
        address: "Rua Um, 10",
        city: "São Paulo",
        state: "SP",
        isPublished: true,
      });
    const secondLocation = await request(app.getHttpServer())
      .post(`/locations?organizationId=${secondOrganization.id}`)
      .set("Cookie", secondCookie)
      .send({
        name: `Unidade Lead B ${suffix}`,
        address: "Rua Dois, 20",
        city: "Curitiba",
        state: "PR",
        isPublished: true,
      });
    assert.equal(firstVehicle.status, 201);
    assert.equal(secondVehicle.status, 201);
    assert.equal(firstLocation.status, 201);
    assert.equal(secondLocation.status, 201);

    const leadInput = {
      contactName: "Visitor Example",
      email: "visitor@example.com",
      phone: "11912345678",
      message: "Gostaria de receber uma cotação.",
      vehicleId: firstVehicle.body.id as string,
      locationId: firstLocation.body.id as string,
    };
    const created = await request(app.getHttpServer())
      .post(`/public/${firstSlug}/leads`)
      .send(leadInput);
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.id, undefined);
    assert.equal(created.body.contactName, undefined);
    assert.equal(created.body.phone, undefined);
    assert.equal(created.body.organizationId, undefined);
    const savedLead = await prisma.lead.findFirstOrThrow({
      where: { contactName: leadInput.contactName },
    });
    assert.equal(savedLead.organizationId, firstOrganization.id);
    assert.equal(savedLead.vehicleId, firstVehicle.body.id);
    assert.equal(savedLead.locationId, firstLocation.body.id);

    const crossTenantVehicle = await request(app.getHttpServer())
      .post(`/public/${firstSlug}/leads`)
      .send({ ...leadInput, vehicleId: secondVehicle.body.id });
    assert.equal(crossTenantVehicle.status, 400);
    const crossTenantLocation = await request(app.getHttpServer())
      .post(`/public/${firstSlug}/leads`)
      .send({ ...leadInput, locationId: secondLocation.body.id });
    assert.equal(crossTenantLocation.status, 400);
    const arbitraryOrganization = await request(app.getHttpServer())
      .post(`/public/${firstSlug}/leads`)
      .send({ ...leadInput, organizationId: secondOrganization.id });
    assert.equal(arbitraryOrganization.status, 400);
  });

  it("rejects unpublished sites, inactive organizations and unknown tenants", async () => {
    const suffix = Date.now().toString();
    const registration = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: `inactive-${suffix}@example.com`,
        password: "correct-horse-battery-staple",
        organizationName: `Inactive Rental ${suffix}`,
      });
    const cookie = cookieValue(registration);
    const organization = await prisma.organization.findFirstOrThrow({
      where: { name: `Inactive Rental ${suffix}` },
    });
    const unpublishedSlug = `unpublished-${suffix}`;
    const unpublishedSite = await request(app.getHttpServer())
      .post(`/sites?organizationId=${organization.id}`)
      .set("Cookie", cookie)
      .send({
        publicName: "Unpublished",
        slug: unpublishedSlug,
        isPublished: false,
      });
    assert.equal(unpublishedSite.status, 201);
    assert.equal(
      (
        await request(app.getHttpServer()).get(
          `/public/${unpublishedSlug}/site`,
        )
      ).status,
      404,
    );

    const publishedSite = await request(app.getHttpServer())
      .patch(
        `/sites/${unpublishedSite.body.id}?organizationId=${organization.id}`,
      )
      .set("Cookie", cookie)
      .send({ isPublished: true });
    assert.equal(publishedSite.status, 200);
    assert.equal(
      (
        await request(app.getHttpServer()).get(
          `/public/${unpublishedSlug}/site`,
        )
      ).status,
      200,
    );
    await prisma.organization.update({
      where: { id: organization.id },
      data: { isActive: false },
    });
    assert.equal(
      (
        await request(app.getHttpServer()).get(
          `/public/${unpublishedSlug}/site`,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await request(app.getHttpServer()).get(
          `/public/unknown-${suffix}/site`,
        )
      ).status,
      404,
    );
  });
});
