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
import { CurrentUser } from "../decorator/current-user.decorator.js";
import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import {
  BulkDeleteVehiclesDto,
  CreateVehicleDto,
  OrganizationQueryDto,
  UpdateVehicleDto,
  VehicleListQueryDto,
} from "./vehicle.dto.js";
import { VehiclesService } from "./vehicles.service.js";

@Controller("vehicles")
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VehicleListQueryDto,
  ) {
    return this.vehiclesService.list(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
    @Body() input: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(user.id, query.organizationId, input);
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  deleteMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
    @Body() input: BulkDeleteVehiclesDto,
  ) {
    return this.vehiclesService.deleteMany(
      user.id,
      query.organizationId,
      input.ids,
    );
  }

  @Get(":id")
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.vehiclesService.getById(user.id, query.organizationId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
    @Param("id") id: string,
    @Body() input: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(
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
    @Query() query: OrganizationQueryDto,
    @Param("id") id: string,
  ) {
    return this.vehiclesService.delete(user.id, query.organizationId, id);
  }
}
