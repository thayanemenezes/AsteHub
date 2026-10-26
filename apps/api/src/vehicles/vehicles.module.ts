import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { VehiclesController } from "./vehicles.controller.js";
import { VehiclesService } from "./vehicles.service.js";

@Module({
  controllers: [VehiclesController],
  providers: [AuthGuard, VehiclesService],
})
export class VehiclesModule {}
