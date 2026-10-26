import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleListQueryDto,
} from "./vehicle.dto.js";

const vehicleSelection = {
  id: true,
  make: true,
  model: true,
  year: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: VehicleListQueryDto) {
    await this.requireMembership(userId, query.organizationId);
    const where = { organizationId: query.organizationId };
    const total = await this.prisma.vehicle.count({ where });
    const totalPages = Math.ceil(total / query.limit);
    const page = Math.min(query.page, Math.max(totalPages, 1));
    const data = await this.prisma.vehicle.findMany({
      where,
      select: vehicleSelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * query.limit,
      take: query.limit,
    });

    return {
      data,
      page,
      limit: query.limit,
      total,
      totalPages,
    };
  }

  async getById(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, organizationId },
      select: vehicleSelection,
    });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found.");
    }
    return vehicle;
  }

  async create(
    userId: string,
    organizationId: string,
    input: CreateVehicleDto,
  ) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.vehicle.create({
      data: { ...input, organizationId },
      select: vehicleSelection,
    });
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    input: UpdateVehicleDto,
  ) {
    await this.requireMembership(userId, organizationId);
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one vehicle field is required.");
    }

    try {
      return await this.prisma.vehicle.update({
        where: { id, organizationId },
        data: input,
        select: vehicleSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Vehicle not found.");
      }
      throw error;
    }
  }

  async delete(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const deleted = await this.prisma.vehicle.deleteMany({
      where: { id, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Vehicle not found.");
    }
  }

  async deleteMany(userId: string, organizationId: string, ids: string[]) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.vehicle.findMany({
        where: { id: { in: ids }, organizationId },
        select: { id: true },
      });
      if (existing.length !== ids.length) {
        throw new NotFoundException("One or more vehicles were not found.");
      }

      const deleted = await transaction.vehicle.deleteMany({
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
