import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { VehiclesController } from "./vehicles.controller.js";
import { VehiclesService } from "./vehicles.service.js";
import { VehicleImageUploadService } from "./vehicle-image-upload.service.js";

@Module({
  controllers: [VehiclesController],
  providers: [AuthGuard, VehiclesService, VehicleImageUploadService],
})
export class VehiclesModule {}
