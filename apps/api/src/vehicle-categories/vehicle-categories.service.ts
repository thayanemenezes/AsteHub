import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateVehicleCategoryDto,
  UpdateVehicleCategoryDto,
  VehicleCategoryListQueryDto,
} from "./vehicle-category.dto.js";

const vehicleCategorySelection = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VehicleCategorySelect;

@Injectable()
export class VehicleCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: VehicleCategoryListQueryDto) {
    await this.requireMembership(userId, query.organizationId);
    const where = { organizationId: query.organizationId };
    const total = await this.prisma.vehicleCategory.count({ where });
    const totalPages = Math.ceil(total / query.limit);
    const page = Math.min(query.page, Math.max(totalPages, 1));
    const data = await this.prisma.vehicleCategory.findMany({
      where,
      select: vehicleCategorySelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * query.limit,
      take: query.limit,
    });

    return { data, page, limit: query.limit, total, totalPages };
  }

  async getById(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const category = await this.prisma.vehicleCategory.findFirst({
      where: { id, organizationId },
      select: vehicleCategorySelection,
    });
    if (!category) {
      throw new NotFoundException("Vehicle category not found.");
    }
    return category;
  }

  async create(
    userId: string,
    organizationId: string,
    input: CreateVehicleCategoryDto,
  ) {
    await this.requireMembership(userId, organizationId);
    try {
      return await this.prisma.vehicleCategory.create({
        data: { ...input, organizationId },
        select: vehicleCategorySelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle category with this name already exists.",
        );
      }
      throw error;
    }
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    input: UpdateVehicleCategoryDto,
  ) {
    await this.requireMembership(userId, organizationId);
    if (Object.keys(input).length === 0) {
      throw new BadRequestException(
        "At least one vehicle category field is required.",
      );
    }

    try {
      return await this.prisma.vehicleCategory.update({
        where: { id, organizationId },
        data: input,
        select: vehicleCategorySelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Vehicle category not found.");
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle category with this name already exists.",
        );
      }
      throw error;
    }
  }

  async delete(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const deleted = await this.prisma.vehicleCategory.deleteMany({
      where: { id, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Vehicle category not found.");
    }
  }

  async deleteMany(userId: string, organizationId: string, ids: string[]) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.vehicleCategory.findMany({
        where: { id: { in: ids }, organizationId },
        select: { id: true },
      });
      if (existing.length !== ids.length) {
        throw new NotFoundException(
          "One or more vehicle categories were not found.",
        );
      }

      const deleted = await transaction.vehicleCategory.deleteMany({
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
