import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../src/prisma/prisma.service.js";
import { VehicleImageUploadService } from "../../src/vehicles/vehicle-image-upload.service.js";

const originalEnvironment = new Map(
  [
    "AWS_REGION",
    "AWS_S3_BUCKET",
    "AWS_S3_PUBLIC_BASE_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ].map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const [key, value] of originalEnvironment) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

function serviceWithMembership(
  membership: { id: string } | null,
): VehicleImageUploadService {
  const prisma = {
    membership: {
      findFirst: async () => membership,
    },
  } as unknown as PrismaService;
  return new VehicleImageUploadService(prisma);
}

describe("vehicle image upload signing", () => {
  it("creates a size- and content-type-constrained URL under the tenant prefix", async () => {
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_S3_BUCKET = "astehub-test-media";
    process.env.AWS_S3_PUBLIC_BASE_URL = "https://cdn.example.com/";
    process.env.AWS_ACCESS_KEY_ID = "test-access-key";
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";

    const upload = await serviceWithMembership({
      id: "membership-1",
    }).createUploadRequest("user-1", "organization-1", {
      contentType: "image/png",
      size: 1024,
    });

    assert.match(
      upload.fields.key ?? "",
      /^organizations\/organization-1\/vehicles\/[0-9a-f-]+\.png$/,
    );
    assert.equal(upload.fields["Content-Type"], "image/png");
    assert.equal(
      upload.imageUrl,
      `https://cdn.example.com/${upload.fields.key}`,
    );
    const policy = JSON.parse(
      Buffer.from(upload.fields.Policy ?? "", "base64").toString("utf8"),
    ) as { conditions: unknown[][] };
    assert.ok(
      policy.conditions.some(
        (condition) =>
          condition[0] === "content-length-range" &&
          condition[1] === 1 &&
          condition[2] === 10 * 1024 * 1024,
      ),
    );
  });

  it("does not issue a URL to users without active tenant membership", async () => {
    const service = serviceWithMembership(null);

    await assert.rejects(
      service.createUploadRequest("user-1", "organization-2", {
        contentType: "image/png",
        size: 1024,
      }),
      ForbiddenException,
    );
  });
});
