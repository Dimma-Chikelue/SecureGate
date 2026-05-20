import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

  // 1. Rate Limiting for Credentials Login Callback API
  if (path === "/api/auth/callback/credentials" && req.method === "POST") {
    // 5 attempts per IP per 10 minutes
    const limitRes = await rateLimit(ip, 5, 10);
    if (!limitRes.success) {
      const loginUrl = new URL("/login?error=RateLimit", req.url);
      return new NextResponse(
        JSON.stringify({ url: loginUrl.toString() }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 2. Route Protection
  const isDashboard = path.startsWith("/dashboard");
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isDashboard) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!token.emailVerified) {
      const unverifiedUrl = new URL("/login?error=Unverified", req.url);
      return NextResponse.redirect(unverifiedUrl);
    }
  }

  // 3. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/auth/callback/credentials"
  ],
};
