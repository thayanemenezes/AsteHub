import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { VehicleCategoriesController } from "./vehicle-categories.controller.js";
import { VehicleCategoriesService } from "./vehicle-categories.service.js";

@Module({
  controllers: [VehicleCategoriesController],
  providers: [AuthGuard, VehicleCategoriesService],
})
export class VehicleCategoriesModule {}
