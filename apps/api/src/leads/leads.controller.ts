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
  BulkDeleteLeadsDto,
  CreateLeadDto,
  LeadListQueryDto,
  LeadOrganizationQueryDto,
  UpdateLeadDto,
} from "./lead.dto.js";
import { LeadsService } from "./leads.service.js";

@Controller("leads")
@UseGuards(AuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LeadListQueryDto,
  ) {
    return this.leadsService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LeadOrganizationQueryDto,
    @Body() input: CreateLeadDto,
  ) {
    return this.leadsService.create(user.id, query.organizationId, input);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  deleteMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LeadOrganizationQueryDto,
    @Body() input: BulkDeleteLeadsDto,
  ) {
    return this.leadsService.deleteMany(
      user.id,
      query.organizationId,
      input.ids,
    );
  }

  @Get(":id")
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LeadOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.leadsService.getById(user.id, query.organizationId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LeadOrganizationQueryDto,
    @Param("id") id: string,
    @Body() input: UpdateLeadDto,
  ) {
    return this.leadsService.update(
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
    @Query() query: LeadOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.leadsService.delete(user.id, query.organizationId, id);
  }
}
