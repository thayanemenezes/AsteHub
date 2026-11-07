import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  MAX_VEHICLE_IMAGE_SIZE,
  type VehicleImageUploadDto,
} from "./vehicle.dto.js";

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

@Injectable()
export class VehicleImageUploadService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
  });

  constructor(private readonly prisma: PrismaService) {}

  async createUploadRequest(
    userId: string,
    organizationId: string,
    input: VehicleImageUploadDto,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException("Active organization membership required.");
    }

    const region = process.env.AWS_REGION?.trim();
    const bucket = process.env.AWS_S3_BUCKET?.trim();
    const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.trim().replace(
      /\/+$/,
      "",
    );
    if (!region || !bucket || !publicBaseUrl) {
      throw new ServiceUnavailableException(
        "Vehicle image uploads are not configured.",
      );
    }

    let publicBase: URL;
    try {
      publicBase = new URL(publicBaseUrl);
    } catch {
      throw new ServiceUnavailableException(
        "Vehicle image public URL is not configured correctly.",
      );
    }
    if (
      !["http:", "https:"].includes(publicBase.protocol) ||
      publicBase.search ||
      publicBase.hash ||
      (process.env.NODE_ENV === "production" &&
        publicBase.protocol !== "https:")
    ) {
      throw new ServiceUnavailableException(
        "Vehicle image public URL must be a valid HTTPS URL in production.",
      );
    }

    const key = `organizations/${organizationId}/vehicles/${randomUUID()}.${imageExtensions[input.contentType]}`;
    const post = await createPresignedPost(this.s3, {
      Bucket: bucket,
      Key: key,
      Expires: 300,
      Fields: { "Content-Type": input.contentType },
      Conditions: [
        ["content-length-range", 1, MAX_VEHICLE_IMAGE_SIZE],
        ["eq", "$Content-Type", input.contentType],
      ],
    });
    const imagePath = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return {
      ...post,
      imageUrl: `${publicBase.toString().replace(/\/+$/, "")}/${imagePath}`,
    };
  }
}
