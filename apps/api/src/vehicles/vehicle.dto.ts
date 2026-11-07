import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  ArrayMaxSize,
  ArrayUnique,
  IsBoolean,
  IsArray,
  IsInt,
  IsIn,
  IsUrl,
  ValidateNested,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class OrganizationQueryDto {
  @IsString()
  @Length(1, 30)
  organizationId!: string;
}

export class VehicleListQueryDto extends OrganizationQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

export const VEHICLE_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MAX_VEHICLE_IMAGE_SIZE = 10 * 1024 * 1024;

export class VehicleImageUploadDto {
  @IsIn(VEHICLE_IMAGE_CONTENT_TYPES)
  contentType!: (typeof VEHICLE_IMAGE_CONTENT_TYPES)[number];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_VEHICLE_IMAGE_SIZE)
  size!: number;
}

export class VehicleCustomFieldDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  name!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 250)
  value!: string;
}

function customFieldUniqueIdentifier(field: VehicleCustomFieldDto): string {
  return typeof field?.name === "string" ? field.name.toLowerCase() : "";
}

export class CreateVehicleDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  make!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 100)
  model!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1886)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  series?: string;

  @IsOptional()
  @IsBoolean()
  isElectric?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUrl(
    { protocols: ["http", "https"], require_protocol: true },
    { each: true },
  )
  @MaxLength(2048, { each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique(customFieldUniqueIdentifier)
  @ValidateNested({ each: true })
  @Type(() => VehicleCustomFieldDto)
  customFields?: VehicleCustomFieldDto[];
}

export class UpdateVehicleDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  make?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 100)
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1886)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  series?: string | null;

  @IsOptional()
  @IsBoolean()
  isElectric?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUrl(
    { protocols: ["http", "https"], require_protocol: true },
    { each: true },
  )
  @MaxLength(2048, { each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique(customFieldUniqueIdentifier)
  @ValidateNested({ each: true })
  @Type(() => VehicleCustomFieldDto)
  customFields?: VehicleCustomFieldDto[];
}

export class BulkDeleteVehiclesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  ids!: string[];
}
