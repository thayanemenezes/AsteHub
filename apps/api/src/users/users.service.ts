import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { MembershipRole, Prisma } from "@prisma/client";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  verifyPassword,
} from "../auth/auth-crypto.js";
import { AuthEmailService } from "../auth/auth-email.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AcceptOrganizationInvitationDto,
  CreateOrganizationInvitationDto,
  UpdateOrganizationMemberDto,
  UpdateUserSettingsDto,
} from "./users.dto.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const memberSelection = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  user: { select: { email: true } },
} satisfies Prisma.MembershipSelect;

const invitationSelection = {
  id: true,
  email: true,
  role: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.OrganizationInvitationSelect;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authEmail: AuthEmailService,
  ) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { dashboardLanguage: true },
    });
    return {
      language: user.dashboardLanguage === "EN" ? "en" : "pt-BR",
    };
  }

  async updateSettings(userId: string, input: UpdateUserSettingsDto) {
    if (input.language !== "pt-BR" && input.language !== "en") {
      throw new BadRequestException(
        "A supported dashboard language is required.",
      );
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { dashboardLanguage: input.language === "en" ? "EN" : "PT_BR" },
      select: { dashboardLanguage: true },
    });
    return {
      language: user.dashboardLanguage === "EN" ? "en" : "pt-BR",
    };
  }

  async list(userId: string, organizationId: string) {
    await this.requireActiveMembership(userId, organizationId);
    const now = new Date();
    const [members, invitations] = await Promise.all([
      this.prisma.membership.findMany({
        where: { organizationId },
        select: memberSelection,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
      this.prisma.organizationInvitation.findMany({
        where: { organizationId, expiresAt: { gt: now } },
        select: invitationSelection,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
    ]);

    return {
      members: members.map(({ user, ...membership }) => ({
        ...membership,
        email: user.email,
      })),
      invitations,
    };
  }

  async invite(
    userId: string,
    organizationId: string,
    input: CreateOrganizationInvitationDto,
  ) {
    const actor = await this.requireManager(userId, organizationId);
    if (input.role === MembershipRole.OWNER && actor.role !== "OWNER") {
      throw new ForbiddenException("Only an owner can invite another owner.");
    }

    const email = normalizeEmail(input.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId,
          },
        },
        select: { id: true },
      });
      if (membership) {
        throw new ConflictException(
          "This user already has access to the organization.",
        );
      }
    }

    const invitationWhere = {
      organizationId_email: { organizationId, email },
    };
    const existingInvitation =
      await this.prisma.organizationInvitation.findUnique({
        where: invitationWhere,
        select: { id: true, expiresAt: true },
      });
    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      throw new ConflictException("An invitation is already pending.");
    }
    if (existingInvitation) {
      await this.prisma.organizationInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    const token = createSessionToken();
    let invitation: Prisma.OrganizationInvitationGetPayload<{
      select: typeof invitationSelection;
    }>;
    try {
      invitation = await this.prisma.organizationInvitation.create({
        data: {
          organizationId,
          email,
          tokenHash: hashSessionToken(token),
          role: input.role,
          expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        },
        select: invitationSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("An invitation is already pending.");
      }
      throw error;
    }

    try {
      await this.authEmail.sendOrganizationInvitation(
        email,
        token,
        actor.organization.name,
      );
    } catch (error) {
      await this.prisma.organizationInvitation.deleteMany({
        where: { id: invitation.id, tokenHash: hashSessionToken(token) },
      });
      this.logger.error(
        "Organization invitation email delivery failed.",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw new ServiceUnavailableException(
        "The invitation could not be sent. Please try again.",
      );
    }

    return invitation;
  }

  async acceptInvitation(input: AcceptOrganizationInvitationDto) {
    const tokenHash = hashSessionToken(input.token);
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        expiresAt: true,
      },
    });
    const now = new Date();
    if (!invitation || invitation.expiresAt <= now) {
      throw new BadRequestException("Invalid or expired invitation.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, passwordHash: true },
    });
    if (
      existingUser &&
      !(await verifyPassword(existingUser.passwordHash, input.password))
    ) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const passwordHash = existingUser
      ? undefined
      : await hashPassword(input.password);

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const consumed = await transaction.organizationInvitation.deleteMany({
            where: {
              id: invitation.id,
              tokenHash,
              expiresAt: { gt: now },
            },
          });
          if (consumed.count !== 1) {
            throw new BadRequestException("Invalid or expired invitation.");
          }

          const user = existingUser
            ? existingUser
            : await transaction.user.create({
                data: { email: invitation.email, passwordHash: passwordHash! },
                select: { id: true },
              });
          const existingMembership = await transaction.membership.findUnique({
            where: {
              userId_organizationId: {
                userId: user.id,
                organizationId: invitation.organizationId,
              },
            },
            select: { id: true },
          });
          if (existingMembership) {
            throw new ConflictException(
              "This user already has access to the organization.",
            );
          }

          const membership = await transaction.membership.create({
            data: {
              userId: user.id,
              organizationId: invitation.organizationId,
              role: invitation.role,
              status: "ACTIVE",
            },
            select: { id: true, role: true, status: true },
          });
          return {
            id: user.id,
            email: invitation.email,
            role: membership.role,
            status: membership.status,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "An account with this email already exists. Try accepting the invitation again with its password.",
        );
      }
      throw error;
    }
  }

  async updateMember(
    userId: string,
    organizationId: string,
    membershipId: string,
    input: UpdateOrganizationMemberDto,
  ) {
    const actor = await this.requireManager(userId, organizationId);
    if (input.role === "OWNER" && actor.role !== "OWNER") {
      throw new ForbiddenException("Only an owner can promote another owner.");
    }

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const target = await transaction.membership.findFirst({
            where: { id: membershipId, organizationId },
            select: {
              id: true,
              role: true,
              status: true,
              user: { select: { email: true } },
            },
          });
          if (!target) {
            throw new NotFoundException("Organization member not found.");
          }
          if (actor.role !== "OWNER" && target.role === "OWNER") {
            throw new ForbiddenException("Only an owner can manage owners.");
          }
          if (
            target.role === "OWNER" &&
            target.status === "ACTIVE" &&
            input.role !== "OWNER"
          ) {
            await this.requireAnotherOwner(transaction, organizationId);
          }

          const updated = await transaction.membership.update({
            where: { id: target.id },
            data: { role: input.role },
            select: { id: true, role: true, status: true, createdAt: true },
          });
          return { ...updated, email: target.user.email };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new ConflictException(
          "The organization owner changed during this request. Please try again.",
        );
      }
      throw error;
    }
  }

  async removeMember(
    userId: string,
    organizationId: string,
    membershipId: string,
  ) {
    const actor = await this.requireManager(userId, organizationId);
    try {
      await this.prisma.$transaction(
        async (transaction) => {
          const target = await transaction.membership.findFirst({
            where: { id: membershipId, organizationId },
            select: { id: true, role: true, status: true },
          });
          if (!target) {
            throw new NotFoundException("Organization member not found.");
          }
          if (actor.role !== "OWNER" && target.role === "OWNER") {
            throw new ForbiddenException("Only an owner can remove owners.");
          }
          if (target.role === "OWNER" && target.status === "ACTIVE") {
            await this.requireAnotherOwner(transaction, organizationId);
          }
          await transaction.membership.delete({ where: { id: target.id } });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new ConflictException(
          "The organization owner changed during this request. Please try again.",
        );
      }
      throw error;
    }
  }

  async revokeInvitation(
    userId: string,
    organizationId: string,
    invitationId: string,
  ) {
    await this.requireManager(userId, organizationId);
    const deleted = await this.prisma.organizationInvitation.deleteMany({
      where: { id: invitationId, organizationId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException("Organization invitation not found.");
    }
  }

  private async requireAnotherOwner(
    transaction: Prisma.TransactionClient,
    organizationId: string,
  ) {
    const ownerCount = await transaction.membership.count({
      where: { organizationId, role: "OWNER", status: "ACTIVE" },
    });
    if (ownerCount <= 1) {
      throw new ConflictException(
        "The organization must have at least one active owner.",
      );
    }
  }

  private async requireActiveMembership(
    userId: string,
    organizationId: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException("Active organization membership required.");
    }
  }

  private async requireManager(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId, status: "ACTIVE" },
      select: {
        role: true,
        organization: { select: { name: true } },
      },
    });
    if (!membership) {
      throw new ForbiddenException("Active organization membership required.");
    }
    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      throw new ForbiddenException(
        "Only organization owners and admins can manage members.",
      );
    }
    return membership;
  }
}
