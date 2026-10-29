import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateLocationDto,
  LocationListQueryDto,
  UpdateLocationDto,
} from "./location.dto.js";

const locationSelection = {
  id: true,
  name: true,
  address: true,
  city: true,
  state: true,
  phone: true,
  description: true,
  managerName: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LocationSelect;

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: LocationListQueryDto) {
    await this.requireMembership(userId, query.organizationId);
    const where = { organizationId: query.organizationId };
    const total = await this.prisma.location.count({ where });
    const totalPages = Math.ceil(total / query.limit);
    const page = Math.min(query.page, Math.max(totalPages, 1));
    const data = await this.prisma.location.findMany({
      where,
      select: locationSelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * query.limit,
      take: query.limit,
    });

    return { data, page, limit: query.limit, total, totalPages };
  }

  async getById(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const location = await this.prisma.location.findFirst({
      where: { id, organizationId },
      select: locationSelection,
    });
    if (!location) {
      throw new NotFoundException("Location not found.");
    }
    return location;
  }

  async create(userId: string, organizationId: string, input: CreateLocationDto) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.location.create({
      data: { ...input, organizationId },
      select: locationSelection,
    });
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    input: UpdateLocationDto,
  ) {
    await this.requireMembership(userId, organizationId);
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one location field is required.");
    }

    try {
      return await this.prisma.location.update({
        where: { id, organizationId },
        data: input,
        select: locationSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Location not found.");
      }
      throw error;
    }
  }

  async delete(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const deleted = await this.prisma.location.deleteMany({
      where: { id, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Location not found.");
    }
  }

  async deleteMany(userId: string, organizationId: string, ids: string[]) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.location.findMany({
        where: { id: { in: ids }, organizationId },
        select: { id: true },
      });
      if (existing.length !== ids.length) {
        throw new NotFoundException("One or more locations were not found.");
      }

      const deleted = await transaction.location.deleteMany({
        where: { id: { in: ids }, organizationId },
      });
      return { deletedCount: deleted.count };
    });
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
