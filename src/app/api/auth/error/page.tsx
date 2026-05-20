"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Unverified":
        return {
          title: "Email Not Verified",
          message: "Please verify your email address before signing in. Check your inbox for the verification link.",
        };
      case "CredentialsSignin":
        return {
          title: "Sign In Failed",
          message: "Invalid email or password. Please check your credentials and try again.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to access this resource.",
        };
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return {
          title: "Authentication Error",
          message: "An error occurred during authentication. Please try again.",
        };
      default:
        return {
          title: "Something Went Wrong",
          message: "An unexpected error occurred. Please try again or contact support.",
        };
    }
  };

  const { title, message } = getErrorMessage(error);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          SecureGate
        </Link>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{message}</p>

        <div className="error-actions">
          <Link href="/login" className="btn btn-primary btn-full">
            Back to Sign In
          </Link>
          <Link href="/forgot-password" className="link">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
