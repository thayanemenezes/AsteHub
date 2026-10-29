import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { VehiclesModule } from "./vehicles/vehicles.module.js";
import { VehicleCategoriesModule } from "./vehicle-categories/vehicle-categories.module.js";
import { LocationsModule } from "./locations/locations.module.js";
import { SitesModule } from "./sites/sites.module.js";
import { LeadsModule } from "./leads/leads.module.js";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    VehiclesModule,
    VehicleCategoriesModule,
    LocationsModule,
    SitesModule,
    LeadsModule,
  ],
})
export class AppModule {}
