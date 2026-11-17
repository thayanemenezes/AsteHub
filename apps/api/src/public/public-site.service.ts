import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CreateLeadDto } from "../leads/lead.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PublicLeadRateLimiter } from "./public-lead-rate-limiter.js";

const publicSiteSelection = {
  publicName: true,
  slug: true,
  phone: true,
  description: true,
  primaryColor: true,
  secondaryColor: true,
  logoUrl: true,
  seoTitle: true,
  seoDescription: true,
  ogTitle: true,
  ogDescription: true,
  ogImageUrl: true,
} satisfies Prisma.SiteSelect;

const publicVehicleSelection = {
  id: true,
  make: true,
  model: true,
  year: true,
  description: true,
  series: true,
  isElectric: true,
  images: true,
  category: { select: { id: true, name: true } },
} satisfies Prisma.VehicleSelect;

const publicLocationSelection = {
  id: true,
  name: true,
  address: true,
  city: true,
  state: true,
  phone: true,
  description: true,
} satisfies Prisma.LocationSelect;

@Injectable()
export class PublicSiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: PublicLeadRateLimiter,
  ) {}

  async getSite(tenant: string) {
    const site = await this.resolveSite(tenant);
    return this.prisma.site.findUniqueOrThrow({
      where: { id: site.id },
      select: publicSiteSelection,
    });
  }

  async listVehicles(
    tenant: string,
    page: number,
    limit: number,
    categoryId?: string,
  ) {
    const site = await this.resolveSite(tenant);
    const where: Prisma.VehicleWhereInput = {
      organizationId: site.organizationId,
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
    };
    const total = await this.prisma.vehicle.count({ where });
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const results = await this.prisma.vehicle.findMany({
      where,
      select: publicVehicleSelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });

    return {
      data: results,
      page: currentPage,
      limit,
      total,
      totalPages,
    };
  }

  async getVehicle(tenant: string, vehicleId: string) {
    const site = await this.resolveSite(tenant);
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        organizationId: site.organizationId,
        isPublished: true,
      },
      select: publicVehicleSelection,
    });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found.");
    }
    return vehicle;
  }

  async listCategories(tenant: string) {
    const site = await this.resolveSite(tenant);
    return this.prisma.vehicleCategory.findMany({
      where: {
        organizationId: site.organizationId,
        vehicles: { some: { isPublished: true } },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  async listLocations(tenant: string, page: number, limit: number) {
    const site = await this.resolveSite(tenant);
    const where: Prisma.LocationWhereInput = {
      organizationId: site.organizationId,
      isPublished: true,
    };
    const total = await this.prisma.location.count({ where });
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const results = await this.prisma.location.findMany({
      where,
      select: publicLocationSelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });

    return {
      data: results,
      page: currentPage,
      limit,
      total,
      totalPages,
    };
  }

  async createLead(
    tenant: string,
    input: CreateLeadDto,
    ipAddress: string,
  ): Promise<{ accepted: true }> {
    const site = await this.resolveSite(tenant);

    const [vehicle, location] = await Promise.all([
      input.vehicleId
        ? this.prisma.vehicle.findFirst({
            where: {
              id: input.vehicleId,
              organizationId: site.organizationId,
              isPublished: true,
            },
            select: { id: true },
          })
        : Promise.resolve(null),
      input.locationId
        ? this.prisma.location.findFirst({
            where: {
              id: input.locationId,
              organizationId: site.organizationId,
              isPublished: true,
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (input.vehicleId && !vehicle) {
      throw new BadRequestException(
        "Vehicle must be published and belong to this organization.",
      );
    }
    if (input.locationId && !location) {
      throw new BadRequestException(
        "Location must be published and belong to this organization.",
      );
    }

    this.rateLimiter.assertAllowed(ipAddress, site.slug);
    await this.prisma.lead.create({
      data: {
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        vehicleId: input.vehicleId,
        locationId: input.locationId,
        organizationId: site.organizationId,
      },
      select: { id: true },
    });

    return { accepted: true };
  }

  private async resolveSite(tenant: string) {
    const slug = this.slugFromTenant(tenant);
    const site = await this.prisma.site.findFirst({
      where: {
        slug,
        isPublished: true,
        organization: { is: { isActive: true } },
      },
      select: { id: true, slug: true, organizationId: true },
    });
    if (!site) {
      throw new NotFoundException("Public site not found.");
    }
    return site;
  }

  private slugFromTenant(tenant: string): string {
    const normalized = tenant.trim().toLowerCase().replace(/\.$/, "");
    const baseDomain = process.env.PUBLIC_BASE_DOMAIN?.trim().toLowerCase();
    const suffix = baseDomain ? `.${baseDomain}` : "";
    const slug =
      suffix && normalized.endsWith(suffix)
        ? normalized.slice(0, -suffix.length)
        : normalized;

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new NotFoundException("Public site not found.");
    }
    return slug;
  }
}
