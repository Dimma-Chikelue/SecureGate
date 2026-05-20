"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validations";

export async function resetPassword(token: string | null, values: { password: string } | FormData) {
  if (!token) {
    return { error: "Token is required" };
  }

  // Convert FormData to object if needed
  let data = values;
  if (values instanceof FormData) {
    data = { password: values.get("password") };
  }

  const validated = ResetPasswordSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || "Invalid fields" };
  }

  const { password } = validated.data;

  try {
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return { error: "Token does not exist or has already been used" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired" };
    }

    const user = await db.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!user) {
      return { error: "User does not exist" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return { success: "Password successfully updated! You can now log in." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
