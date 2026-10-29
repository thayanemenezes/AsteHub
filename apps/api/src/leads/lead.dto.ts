import { LEAD_STATUSES } from "@repo/contracts";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class LeadOrganizationQueryDto {
  @IsString()
  @Length(1, 30)
  organizationId!: string;
}

export class LeadListQueryDto extends LeadOrganizationQueryDto {
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

export class CreateLeadDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(2, 120)
  contactName!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @IsString()
  @Matches(/^\d{8,15}$/)
  phone!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(10, 1000)
  message!: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  locationId?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(2, 120)
  contactName?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsEmail()
  @MaxLength(320)
  email?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8,15}$/)
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(10, 1000)
  message?: string;

  @IsOptional()
  @IsIn(LEAD_STATUSES)
  status?: (typeof LEAD_STATUSES)[number];

  @IsOptional()
  @IsString()
  @Length(1, 30)
  vehicleId?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  locationId?: string | null;
}

export class BulkDeleteLeadsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  ids!: string[];
}
