import { db } from "@/lib/db";
import crypto from "crypto";

export const VERIFICATION_TOKEN_EXPIRY = 15 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000;

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);

  await db.passwordResetToken.create({
    data: { email, token, expires },
  });

  return token;
}
