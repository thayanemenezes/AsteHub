import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetEmailService } from "./password-reset-email.service.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PasswordResetEmailService],
})
export class AuthModule {}
