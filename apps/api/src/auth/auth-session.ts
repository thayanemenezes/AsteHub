import type { CookieOptions } from "express";

export const SESSION_COOKIE_NAME = "astehub_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
  const domain = process.env.COOKIE_DOMAIN?.trim();

  if (domain) {
    options.domain = domain;
  }

  return options;
}

export function clearSessionCookieOptions(): CookieOptions {
  const options = sessionCookieOptions();
  delete options.maxAge;
  return options;
}
