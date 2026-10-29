import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateLeadDto,
  LeadListQueryDto,
  UpdateLeadDto,
} from "./lead.dto.js";

const leadSelection = {
  id: true,
  contactName: true,
  email: true,
  phone: true,
  message: true,
  status: true,
  vehicleId: true,
  locationId: true,
  createdAt: true,
  updatedAt: true,
  vehicle: {
    select: { id: true, make: true, model: true, year: true },
  },
  location: {
    select: { id: true, name: true },
  },
} satisfies Prisma.LeadSelect;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: LeadListQueryDto) {
    await this.requireMembership(userId, query.organizationId);
    const where = { organizationId: query.organizationId };
    const total = await this.prisma.lead.count({ where });
    const totalPages = Math.ceil(total / query.limit);
    const page = Math.min(query.page, Math.max(totalPages, 1));
    const data = await this.prisma.lead.findMany({
      where,
      select: leadSelection,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * query.limit,
      take: query.limit,
    });

    return { data, page, limit: query.limit, total, totalPages };
  }

  async getById(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const lead = await this.prisma.lead.findFirst({
      where: { id, organizationId },
      select: leadSelection,
    });
    if (!lead) {
      throw new NotFoundException("Lead not found.");
    }
    return lead;
  }

  async create(userId: string, organizationId: string, input: CreateLeadDto) {
    await this.requireMembership(userId, organizationId);
    await this.validateReferences(organizationId, input);
    return this.prisma.lead.create({
      data: { ...input, organizationId },
      select: leadSelection,
    });
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    input: UpdateLeadDto,
  ) {
    await this.requireMembership(userId, organizationId);
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one lead field is required.");
    }
    await this.validateReferences(organizationId, input);

    try {
      return await this.prisma.lead.update({
        where: { id, organizationId },
        data: input,
        select: leadSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Lead not found.");
      }
      throw error;
    }
  }

  async delete(userId: string, organizationId: string, id: string) {
    await this.requireMembership(userId, organizationId);
    const deleted = await this.prisma.lead.deleteMany({
      where: { id, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Lead not found.");
    }
  }

  async deleteMany(userId: string, organizationId: string, ids: string[]) {
    await this.requireMembership(userId, organizationId);
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.lead.findMany({
        where: { id: { in: ids }, organizationId },
        select: { id: true },
      });
      if (existing.length !== ids.length) {
        throw new NotFoundException("One or more leads were not found.");
      }

      const deleted = await transaction.lead.deleteMany({
        where: { id: { in: ids }, organizationId },
      });
      return { deletedCount: deleted.count };
    });
  }

  private async validateReferences(
    organizationId: string,
    input: {
      vehicleId?: string | null;
      locationId?: string | null;
    },
  ) {
    if (input.vehicleId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: input.vehicleId, organizationId },
        select: { id: true },
      });
      if (!vehicle) {
        throw new BadRequestException("Vehicle must belong to this organization.");
      }
    }
    if (input.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: input.locationId, organizationId },
        select: { id: true },
      });
      if (!location) {
        throw new BadRequestException("Location must belong to this organization.");
      }
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
