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
  BulkDeleteVehicleCategoriesDto,
  CreateVehicleCategoryDto,
  UpdateVehicleCategoryDto,
  VehicleCategoryListQueryDto,
  VehicleCategoryOrganizationQueryDto,
} from "./vehicle-category.dto.js";
import { VehicleCategoriesService } from "./vehicle-categories.service.js";

@Controller("vehicle-categories")
@UseGuards(AuthGuard)
export class VehicleCategoriesController {
  constructor(
    private readonly vehicleCategoriesService: VehicleCategoriesService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleCategoryListQueryDto,
  ) {
    return this.vehicleCategoriesService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleCategoryOrganizationQueryDto,
    @Body() input: CreateVehicleCategoryDto,
  ) {
    return this.vehicleCategoriesService.create(
      user.id,
      query.organizationId,
      input,
    );
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  deleteMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleCategoryOrganizationQueryDto,
    @Body() input: BulkDeleteVehicleCategoriesDto,
  ) {
    return this.vehicleCategoriesService.deleteMany(
      user.id,
      query.organizationId,
      input.ids,
    );
  }

  @Get(":id")
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleCategoryOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.vehicleCategoriesService.getById(
      user.id,
      query.organizationId,
      id,
    );
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleCategoryOrganizationQueryDto,
    @Param("id") id: string,
    @Body() input: UpdateVehicleCategoryDto,
  ) {
    return this.vehicleCategoriesService.update(
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
    @Query() query: VehicleCategoryOrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.vehicleCategoriesService.delete(
      user.id,
      query.organizationId,
      id,
    );
  }
}
