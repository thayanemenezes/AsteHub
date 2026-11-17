import { Module } from "@nestjs/common";
import { PublicLeadRateLimiter } from "./public-lead-rate-limiter.js";
import { PublicSiteController } from "./public-site.controller.js";
import { PublicSiteService } from "./public-site.service.js";

@Module({
  controllers: [PublicSiteController],
  providers: [PublicLeadRateLimiter, PublicSiteService],
})
export class PublicSiteModule {}
