import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$s7M9B+VpZIeJACWAiLdUuw$NRchQ3b11jrNOoAfrtnApESwXiEs5DtfnW9hP4k7hdE";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function verifyUnknownUserPassword(
  password: string,
): Promise<void> {
  await argon2.verify(DUMMY_PASSWORD_HASH, password);
}
