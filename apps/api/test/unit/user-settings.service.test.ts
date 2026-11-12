import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException } from "@nestjs/common";
import type { PrismaService } from "../../src/prisma/prisma.service.js";
import { UpdateUserSettingsDto } from "../../src/users/users.dto.js";
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
});
