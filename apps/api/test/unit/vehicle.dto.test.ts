import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import "reflect-metadata";
import {
  CreateVehicleDto,
  VehicleImageUploadDto,
} from "../../src/vehicles/vehicle.dto.js";

describe("vehicle details validation", () => {
  it("accepts image URLs and custom name/value fields", () => {
    const input = plainToInstance(CreateVehicleDto, {
      make: "Honda",
      model: "Civic",
      year: 2025,
      categoryId: "category-1",
      series: "Touring",
      isElectric: true,
      images: ["https://images.example.com/civic.jpg"],
      customFields: [{ name: "Cor", value: "Azul" }],
    });

    assert.deepEqual(validateSync(input), []);
  });

  it("rejects category identifiers that are not strings", () => {
    const input = plainToInstance(CreateVehicleDto, {
      make: "Honda",
      model: "Civic",
      year: 2025,
      categoryId: 123,
    });

    assert.ok(
      validateSync(input).some((error) => error.property === "categoryId"),
    );
  });

  it("rejects unsupported image protocols and incomplete custom fields", () => {
    const input = plainToInstance(CreateVehicleDto, {
      make: "Honda",
      model: "Civic",
      year: 2025,
      images: ["javascript:alert(1)"],
      customFields: [{ name: "Cor", value: "" }],
    });

    const errors = validateSync(input);
    assert.ok(errors.some((error) => error.property === "images"));
    assert.ok(errors.some((error) => error.property === "customFields"));
  });

  it("accepts supported image uploads up to the configured size limit", () => {
    const input = plainToInstance(VehicleImageUploadDto, {
      contentType: "image/png",
      size: 10 * 1024 * 1024,
    });

    assert.deepEqual(validateSync(input), []);
  });

  it("rejects non-image uploads and files larger than 10 MB", () => {
    const input = plainToInstance(VehicleImageUploadDto, {
      contentType: "image/svg+xml",
      size: 10 * 1024 * 1024 + 1,
    });

    const errors = validateSync(input);
    assert.ok(errors.some((error) => error.property === "contentType"));
    assert.ok(errors.some((error) => error.property === "size"));
  });
});
