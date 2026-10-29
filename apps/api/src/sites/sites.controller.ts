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
  CreateSiteDto,
  SiteOrganizationQueryDto,
  UpdateSiteDto,
} from "./site.dto.js";
import { SitesService } from "./sites.service.js";

@Controller("sites")
@UseGuards(AuthGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  getByOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SiteOrganizationQueryDto,
  ) {
    return this.sitesService.getByOrganization(user.id, query.organizationId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SiteOrganizationQueryDto,
    @Body() input: CreateSiteDto,
  ) {
    return this.sitesService.create(user.id, query.organizationId, input);
  }

  @Get(":id")
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SiteOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.sitesService.getById(user.id, query.organizationId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SiteOrganizationQueryDto,
    @Param("id") id: string,
    @Body() input: UpdateSiteDto,
  ) {
    return this.sitesService.update(
      user.id,
      query.organizationId,
      id,
      input,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SiteOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.sitesService.delete(user.id, query.organizationId, id);
  }
}
