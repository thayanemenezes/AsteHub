import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateSiteDto, UpdateSiteDto } from "./site.dto.js";

const siteSelection = {
  id: true,
  publicName: true,
  slug: true,
  domain: true,
  phone: true,
  description: true,
  primaryColor: true,
  secondaryColor: true,
  logoUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SiteSelect;

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByOrganization(userId: string, organizationId: string) {
    await this.requireMembership(userId, organizationId);
    const site = await this.prisma.site.findUnique({
      where: { organizationId },
      select: siteSelection,
    });
    if (!site) {
      throw new NotFoundException("Site configuration not found.");
    }
    return site;
  }

  async getById(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const site = await this.prisma.site.findFirst({
      where: { id, organizationId },
      select: siteSelection,
    });
    if (!site) {
      throw new NotFoundException("Site configuration not found.");
    }
    return site;
  }

  async create(userId: string, organizationId: string, input: CreateSiteDto) {
    await this.requireMembership(userId, organizationId);
    try {
      return await this.prisma.site.create({
        data: { ...input, organizationId },
        select: siteSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "The organization, slug, or domain already has a site configuration.",
        );
      }
      throw error;
    }
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    input: UpdateSiteDto,
  ) {
    await this.requireMembership(userId, organizationId);
    if (Object.keys(input).length === 0) {
      throw new BadRequestException(
        "At least one site configuration field is required.",
      );
    }

    try {
      return await this.prisma.site.update({
        where: { id, organizationId },
        data: input,
        select: siteSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Site configuration not found.");
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "The organization, slug, or domain already has a site configuration.",
        );
      }
      throw error;
    }
  }

  async delete(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const deleted = await this.prisma.site.deleteMany({
      where: { id, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Site configuration not found.");
    }
  }

  private async requireMembership(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException("Active organization membership required.");
    }
  }
}
