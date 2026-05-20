"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function verifyEmail(token: string) {
  if (!token) {
    return { error: "Token is required" };
  }

  try {
    const existingToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return { error: "Token does not exist or has already been used" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired" };
    }

    const existingUser = await db.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!existingUser) {
      return { error: "User does not exist" };
    }

    await db.$transaction([
      db.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ]);

    return { success: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("Verification error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function resendVerification(email: string) {
  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Security: do not confirm if the email exists, return generic success
      return { success: "If that email is registered, a new verification link was sent." };
    }

    if (existingUser.emailVerified) {
      return { error: "Email is already verified" };
    }

    // Delete existing tokens if any
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await sendVerificationEmail(email, token);

    return { success: "Verification email sent. Please check your inbox." };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
