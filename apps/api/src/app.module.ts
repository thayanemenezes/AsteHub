import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { VehiclesModule } from "./vehicles/vehicles.module.js";

@Module({
  imports: [PrismaModule, AuthModule, VehiclesModule],
})
export class AppModule {}
