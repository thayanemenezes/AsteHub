import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CreateLeadDto } from "../leads/lead.dto.js";
import { PublicListQueryDto } from "./public-site.dto.js";
import { PublicSiteService } from "./public-site.service.js";

@Controller("public")
export class PublicSiteController {
  constructor(private readonly publicSiteService: PublicSiteService) {}

  @Get(":tenant/site")
  getSite(@Param("tenant") tenant: string) {
    return this.publicSiteService.getSite(tenant);
  }

  @Get(":tenant/vehicles")
  listVehicles(
    @Param("tenant") tenant: string,
    @Query() query: PublicListQueryDto,
  ) {
    return this.publicSiteService.listVehicles(
      tenant,
      query.page,
      query.limit,
      query.categoryId,
    );
  }

  @Get(":tenant/vehicles/:vehicleId")
  getVehicle(
    @Param("tenant") tenant: string,
    @Param("vehicleId") vehicleId: string,
  ) {
    return this.publicSiteService.getVehicle(tenant, vehicleId);
  }

  @Get(":tenant/categories")
  listCategories(@Param("tenant") tenant: string) {
    return this.publicSiteService.listCategories(tenant);
  }

  @Get(":tenant/locations")
  listLocations(
    @Param("tenant") tenant: string,
    @Query() query: PublicListQueryDto,
  ) {
    return this.publicSiteService.listLocations(
      tenant,
      query.page,
      query.limit,
    );
  }

  @Post(":tenant/leads")
  createLead(
    @Param("tenant") tenant: string,
    @Body() input: CreateLeadDto,
    @Req() request: Request,
  ) {
    return this.publicSiteService.createLead(
      tenant,
      input,
      request.ip ?? request.socket.remoteAddress ?? "unknown",
    );
  }
}
