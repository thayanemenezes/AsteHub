import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import "reflect-metadata";
import { UpdateSiteDto } from "../../src/sites/site.dto.js";
import { UpdateUserSettingsDto } from "../../src/users/users.dto.js";

describe("settings validation", () => {
  it("accepts supported dashboard languages", () => {
    const input = plainToInstance(UpdateUserSettingsDto, { language: "en" });

    assert.deepEqual(validateSync(input), []);
  });

  it("rejects unsupported dashboard languages", () => {
    const input = plainToInstance(UpdateUserSettingsDto, {
      language: "fr",
    });

    assert.ok(validateSync(input).some((error) => error.property === "language"));
  });

  it("requires a dashboard language", () => {
    const input = plainToInstance(UpdateUserSettingsDto, {});

    assert.ok(validateSync(input).some((error) => error.property === "language"));
  });

  it("accepts SEO and Open Graph site metadata", () => {
    const input = plainToInstance(UpdateSiteDto, {
      seoTitle: "Locadora Central",
      seoDescription: "Aluguel de veículos em São Paulo.",
      ogTitle: "Conheça a Locadora Central",
      ogDescription: "Encontre o veículo ideal.",
      ogImageUrl: "https://cdn.example.com/preview.png",
    });

    assert.deepEqual(validateSync(input), []);
  });

  it("rejects unsafe Open Graph image URLs and oversized SEO metadata", () => {
    const input = plainToInstance(UpdateSiteDto, {
      seoTitle: "t".repeat(71),
      ogImageUrl: "http://cdn.example.com/preview.png",
    });

    const errors = validateSync(input);
    assert.ok(errors.some((error) => error.property === "seoTitle"));
    assert.ok(errors.some((error) => error.property === "ogImageUrl"));
  });
});
