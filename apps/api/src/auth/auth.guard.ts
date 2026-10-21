import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { hashSessionToken } from "./auth-crypto.js";
import { SESSION_COOKIE_NAME } from "./auth-session.js";
import type { AuthenticatedUser } from "./authenticated-user.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface AuthenticatedRequest extends Request {
  authUser: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE_NAME];

    if (typeof token !== "string" || token.length === 0) {
      throw new UnauthorizedException("Authentication required.");
    }

    const tokenHash = hashSessionToken(token);
    const now = new Date();
    const session = await this.prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: now } },
      select: { user: { select: { id: true, email: true, createdAt: true } } },
    });

    if (!session) {
      await this.prisma.session.deleteMany({
        where: { tokenHash, expiresAt: { lte: now } },
      });
      throw new UnauthorizedException("Authentication required.");
    }

    request.authUser = session.user;
    return true;
  }
}
