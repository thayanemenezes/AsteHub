import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PrismaService } from "../../src/prisma/prisma.service.js";
import {
  UpdateUserProfileDto,
  UpdateUserSettingsDto,
} from "../../src/users/users.dto.js";
import { UsersService } from "../../src/users/users.service.js";

describe("user dashboard settings", () => {
  it("reads preferences only for the authenticated user", async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: async (args: unknown) => {
          assert.deepEqual(args, {
            where: { id: "user-1" },
            select: { dashboardLanguage: true },
          });
          return { dashboardLanguage: "EN" };
        },
      },
    };
    const service = new UsersService(prisma as PrismaService, {} as never);

    assert.deepEqual(await service.getSettings("user-1"), { language: "en" });
  });

  it("updates only the authenticated user's language preference", async () => {
    const prisma = {
      user: {
        update: async (args: unknown) => {
          assert.deepEqual(args, {
            where: { id: "user-1" },
            data: { dashboardLanguage: "PT_BR" },
            select: { dashboardLanguage: true },
          });
          return { dashboardLanguage: "PT_BR" };
        },
      },
    };
    const service = new UsersService(prisma as PrismaService, {} as never);

    assert.deepEqual(
      await service.updateSettings("user-1", { language: "pt-BR" }),
      { language: "pt-BR" },
    );
  });

  it("rejects an empty preference update", async () => {
    const service = new UsersService({} as PrismaService, {} as never);
    const input = Object.assign(new UpdateUserSettingsDto(), {});

    await assert.rejects(
      service.updateSettings("user-1", input),
      BadRequestException,
    );
  });

  it("reads profile data only for the authenticated user", async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: async (args: unknown) => {
          assert.deepEqual(args, {
            where: { id: "user-1" },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          });
          return {
            id: "user-1",
            name: "Ana Silva",
            email: "ana@example.com",
            phone: "11987654321",
            createdAt: new Date("2026-10-20T12:00:00.000Z"),
          };
        },
      },
    };
    const service = new UsersService(prisma as PrismaService, {} as never);

    assert.deepEqual(await service.getProfile("user-1"), {
      id: "user-1",
      name: "Ana Silva",
      email: "ana@example.com",
      phone: "11987654321",
      createdAt: new Date("2026-10-20T12:00:00.000Z"),
    });
  });

  it("updates only the authenticated user's editable profile fields", async () => {
    const input = Object.assign(new UpdateUserProfileDto(), {
      name: " Ana Silva ",
      email: " ANA@EXAMPLE.COM ",
      phone: "11987654321",
    });
    const prisma = {
      user: {
        update: async (args: unknown) => {
          assert.deepEqual(args, {
            where: { id: "user-1" },
            data: {
              name: "Ana Silva",
              email: "ana@example.com",
              phone: "11987654321",
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          });
          return {
            id: "user-1",
            name: "Ana Silva",
            email: "ana@example.com",
            phone: "11987654321",
            createdAt: new Date("2026-10-20T12:00:00.000Z"),
          };
        },
      },
    };
    const service = new UsersService(prisma as PrismaService, {} as never);

    const saved = await service.updateProfile("user-1", input);

    assert.equal(saved.email, "ana@example.com");
    assert.equal(saved.name, "Ana Silva");
    assert.equal(saved.phone, "11987654321");
  });

  it("reports a conflict when the profile email is already in use", async () => {
    const prisma = {
      user: {
        update: async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed",
            { code: "P2002", clientVersion: "test" },
          );
        },
      },
    };
    const service = new UsersService(
      prisma as unknown as PrismaService,
      {} as never,
    );

    await assert.rejects(
      service.updateProfile(
        "user-1",
        Object.assign(new UpdateUserProfileDto(), {
          name: "Ana Silva",
          email: "ana@example.com",
          phone: "",
        }),
      ),
      ConflictException,
    );
  });
});
