"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, FORGOT_PASSWORD_RATE_LIMIT } from "@/lib/rate-limit";

export async function forgotPassword(values: Record<string, unknown> | FormData) {
  const ip = headers().get("x-forwarded-for") || "127.0.0.1";
  
  // Protect forgot-password with 3 attempts per 10 minutes
  const limitRes = await rateLimit(ip, FORGOT_PASSWORD_RATE_LIMIT.limit, FORGOT_PASSWORD_RATE_LIMIT.durationMinutes);
  if (!limitRes.success) {
    const resetSeconds = Math.ceil(limitRes.remainingMs / 1000);
    return { error: `Too many password reset attempts. Please try again in ${resetSeconds} seconds.` };
  }

  // Convert FormData to object if needed
  let data = values;
  if (values instanceof FormData) {
    data = { email: values.get("email") };
  }

  const validated = ForgotPasswordSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid email" };
  }

  const { email } = validated.data;

  // Generic success message to protect privacy (Account Enumeration prevention)
  const genericSuccess = { success: "If that email is registered, a password reset link has been sent." };

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return genericSuccess;
    }

    // Delete any active token for this user
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(email, token);

    return genericSuccess;
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
