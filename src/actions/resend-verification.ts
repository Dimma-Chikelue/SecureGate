"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validations";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit, FORGOT_PASSWORD_RATE_LIMIT } from "@/lib/rate-limit";

export async function resendVerification(formData: FormData) {
  const validated = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated.data;
  const ip = headers().get("x-forwarded-for") || "127.0.0.1";

  const limitRes = await rateLimit(
    `resend:${ip}`,
    FORGOT_PASSWORD_RATE_LIMIT.limit,
    FORGOT_PASSWORD_RATE_LIMIT.durationMinutes
  );
  if (!limitRes.success) {
    return { error: "Too many requests. Please try again later." };
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    return { success: "If applicable, a verification email has been sent." };
  }

  try {
    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  return { success: "Verification email sent." };
}
