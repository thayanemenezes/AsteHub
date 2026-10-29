import { Transform } from "class-transformer";
import {
  IsFQDN,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from "class-validator";

export class SiteOrganizationQueryDto {
  @IsString()
  @Length(1, 30)
  organizationId!: string;
}

function trimToNull(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  return value.trim() || null;
}

export class CreateSiteDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  publicName!: string;

  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Length(1, 60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() || null : value,
  )
  @IsString()
  @MaxLength(253)
  @IsFQDN()
  domain?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  primaryColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  secondaryColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(2048)
  @IsUrl({ protocols: ["https"], require_protocol: true })
  logoUrl?: string | null;
}

export class UpdateSiteDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  publicName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Length(1, 60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() || null : value,
  )
  @IsString()
  @MaxLength(253)
  @IsFQDN()
  domain?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  primaryColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  secondaryColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => trimToNull(value))
  @IsString()
  @MaxLength(2048)
  @IsUrl({ protocols: ["https"], require_protocol: true })
  logoUrl?: string | null;
}
