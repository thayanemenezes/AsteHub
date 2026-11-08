import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { AuthEmailService } from "./auth-email.service.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AuthEmailService],
  exports: [AuthGuard, AuthEmailService],
})
export class AuthModule {}
