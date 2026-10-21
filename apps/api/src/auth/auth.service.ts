import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  verifyPassword,
  verifyUnknownUserPassword,
} from "./auth-crypto.js";
import {
  clearSessionCookieOptions,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./auth-session.js";
import type { AuthenticatedUser } from "./authenticated-user.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    input: { email: string; password: string; organizationName: string },
    response: Response,
  ): Promise<AuthenticatedUser> {
    const email = normalizeEmail(input.email);
    const passwordHash = await hashPassword(input.password);
    const token = createSessionToken();
    const now = new Date();

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: { email, passwordHash },
          select: { id: true, email: true, createdAt: true },
        });
        const organization = await transaction.organization.create({
          data: { name: input.organizationName.trim() },
          select: { id: true },
        });

        await transaction.membership.create({
          data: {
            userId: createdUser.id,
            organizationId: organization.id,
            role: "OWNER",
            status: "ACTIVE",
          },
        });
        await transaction.session.create({
          data: {
            userId: createdUser.id,
            tokenHash: hashSessionToken(token),
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
          },
        });

        return createdUser;
      });

      response.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Unable to register with these details.");
      }
      throw error;
    }
  }

  async login(
    input: { email: string; password: string },
    response: Response,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(input.email) },
      select: { id: true, email: true, createdAt: true, passwordHash: true },
    });

    if (!user) {
      await verifyUnknownUserPassword(input.password);
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (!(await verifyPassword(user.passwordHash, input.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const token = createSessionToken();
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    response.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async logout(requestToken: unknown, response: Response): Promise<void> {
    if (typeof requestToken === "string" && requestToken.length > 0) {
      await this.prisma.session.deleteMany({
        where: { tokenHash: hashSessionToken(requestToken) },
      });
    }

    response.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());
  }

  async getCurrentUser(user: AuthenticatedUser) {
    const current = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            status: true,
            organization: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return {
      id: current.id,
      email: current.email,
      createdAt: current.createdAt,
      organizations: current.memberships.map((membership) => ({
        ...membership.organization,
        role: membership.role,
        status: membership.status,
      })),
    };
  }
}
