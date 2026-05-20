import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return session;
}

export async function requireVerified() {
  const session = await requireAuth();

  if (!(session.user as { emailVerified?: Date | null }).emailVerified) {
    redirect("/login");
  }

  return session;
}
