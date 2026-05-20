"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/mail";

export async function register(values: any) {
  // Convert FormData to object if needed
  let data = values;
  if (values instanceof FormData) {
    data = {
      name: values.get("name"),
      email: values.get("email"),
      password: values.get("password"),
    };
  }
  
  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || "Invalid fields" };
  }

  const { name, email, password } = validated.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user and token in a transaction
    await db.$transaction([
      db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      }),
      db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      }),
    ]);

    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error("Email delivery failed:", emailError);
      // Fail safely: account is created, but warn user that verification mail sending failed
      return { success: "Account created, but verification email failed to send. Please contact support." };
    }

    return { success: "Verification email sent. Please check your inbox." };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
