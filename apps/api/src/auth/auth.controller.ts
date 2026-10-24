import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { CurrentUser } from "../decorator/current-user.decorator.js";
import type { AuthenticatedUser } from "./authenticated-user.js";
import { SESSION_COOKIE_NAME } from "./auth-session.js";
import {
  ConfirmPasswordResetDto,
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
} from "../dto/auth.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(
    @Body() input: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(input, response);
  }

  @Post("login")
  login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(input, response);
  }

  @Post("password-reset")
  @HttpCode(HttpStatus.ACCEPTED)
  requestPasswordReset(@Body() input: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(input.email);
  }

  @Post("password-reset/confirm")
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmPasswordReset(@Body() input: ConfirmPasswordResetDto) {
    return this.authService.confirmPasswordReset(input);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(
      request.cookies?.[SESSION_COOKIE_NAME],
      response,
    );
  }

  @Get("me")
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user);
  }
}
