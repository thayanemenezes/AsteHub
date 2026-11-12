import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { CurrentUser } from "../decorator/current-user.decorator.js";
import {
  AcceptOrganizationInvitationDto,
  CreateOrganizationInvitationDto,
  UpdateOrganizationMemberDto,
  UpdateUserSettingsDto,
  UsersOrganizationQueryDto,
} from "./users.dto.js";
import { UsersService } from "./users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me/settings")
  @UseGuards(AuthGuard)
  getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getSettings(user.id);
  }

  @Patch("me/settings")
  @UseGuards(AuthGuard)
  updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateUserSettingsDto,
  ) {
    return this.usersService.updateSettings(user.id, input);
  }

  @Get()
  @UseGuards(AuthGuard)
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsersOrganizationQueryDto,
  ) {
    return this.usersService.list(user.id, query.organizationId);
  }

  @Post("invitations")
  @UseGuards(AuthGuard)
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsersOrganizationQueryDto,
    @Body() input: CreateOrganizationInvitationDto,
  ) {
    return this.usersService.invite(user.id, query.organizationId, input);
  }

  @Post("invitations/accept")
  @HttpCode(HttpStatus.CREATED)
  acceptInvitation(@Body() input: AcceptOrganizationInvitationDto) {
    return this.usersService.acceptInvitation(input);
  }

  @Patch(":membershipId")
  @UseGuards(AuthGuard)
  updateMember(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsersOrganizationQueryDto,
    @Param("membershipId") membershipId: string,
    @Body() input: UpdateOrganizationMemberDto,
  ) {
    return this.usersService.updateMember(
      user.id,
      query.organizationId,
      membershipId,
      input,
    );
  }

  @Delete("invitations/:invitationId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsersOrganizationQueryDto,
    @Param("invitationId") invitationId: string,
  ) {
    return this.usersService.revokeInvitation(
      user.id,
      query.organizationId,
      invitationId,
    );
  }

  @Delete(":membershipId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsersOrganizationQueryDto,
    @Param("membershipId") membershipId: string,
  ) {
    return this.usersService.removeMember(
      user.id,
      query.organizationId,
      membershipId,
    );
  }
}
