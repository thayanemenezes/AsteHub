import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

export class UsersOrganizationQueryDto {
  @IsString()
  @Length(1, 30)
  organizationId!: string;
}

export class CreateOrganizationInvitationDto {
  @IsEmail()
  @MaxLength(320)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  email!: string;

  @IsIn(["OWNER", "ADMIN", "MEMBER"])
  role!: "OWNER" | "ADMIN" | "MEMBER";
}

export class UpdateOrganizationMemberDto {
  @IsIn(["OWNER", "ADMIN", "MEMBER"])
  role!: "OWNER" | "ADMIN" | "MEMBER";
}

export class UpdateUserSettingsDto {
  @IsIn(["pt-BR", "en"])
  language!: "pt-BR" | "en";
}

export class AcceptOrganizationInvitationDto {
  @IsString()
  @Length(43, 43)
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
