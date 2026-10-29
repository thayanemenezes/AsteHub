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
  BulkDeleteLocationsDto,
  CreateLocationDto,
  LocationListQueryDto,
  LocationOrganizationQueryDto,
  UpdateLocationDto,
} from "./location.dto.js";
import { LocationsService } from "./locations.service.js";

@Controller("locations")
@UseGuards(AuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LocationListQueryDto,
  ) {
    return this.locationsService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LocationOrganizationQueryDto,
    @Body() input: CreateLocationDto,
  ) {
    return this.locationsService.create(user.id, query.organizationId, input);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  deleteMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LocationOrganizationQueryDto,
    @Body() input: BulkDeleteLocationsDto,
  ) {
    return this.locationsService.deleteMany(
      user.id,
      query.organizationId,
      input.ids,
    );
  }

  @Get(":id")
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LocationOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.locationsService.getById(user.id, query.organizationId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LocationOrganizationQueryDto,
    @Param("id") id: string,
    @Body() input: UpdateLocationDto,
  ) {
    return this.locationsService.update(
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
    @Query() query: LocationOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.locationsService.delete(user.id, query.organizationId, id);
  }
}
