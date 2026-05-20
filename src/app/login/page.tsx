"use client";

import { useState, useEffect, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Map all possible error codes to user-friendly messages
  const errorMessages: Record<string, string> = useMemo(() => ({
    RateLimit: "Too many login attempts. Please try again in 10 minutes.",
    CredentialsSignin: "Invalid credentials",
    Unverified: "Please verify your email before signing in",
    AccessDenied: "Access denied. Please try again.",
    OAuthSignin: "Authentication failed. Please try again.",
    OAuthCallback: "Authentication callback failed. Please try again.",
    EmailSigninError: "Could not send sign in email. Please try again.",
    SessionCallback: "Session error. Please sign in again.",
  }), []);

  // Check for any login errors from URL params and display inline
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (!errorParam) {
      setError("");
      return;
    }

    const message = errorMessages[errorParam] || "An error occurred. Please try again.";
    setError(message);

    // Clear the error param from URL so it doesn't persist
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Silently fail if URL manipulation fails - error is already set
    }
  }, [searchParams, errorMessages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Clear error param from URL when user retries
    if (searchParams.get("error")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname);
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Check if rate limited (middleware redirects with error=RateLimit)
      if (result?.status === 307 || result?.status === 308) {
        // Redirect happened - check URL for error param
        const url = new URL(result.url || window.location.href);
        const error = url.searchParams.get("error");
        if (error === "RateLimit") {
          setError("Too many login attempts. Please try again in 10 minutes.");
          setLoading(false);
          return;
        }
      }

      // If result is null or status is not ok, it's an error
      if (!result || !result.ok) {
        const errorMsg = result?.error || "Invalid credentials";
        
        // Map error messages to user-friendly text
        if (errorMsg === "RateLimit" || errorMsg.toLowerCase().includes("rate") || errorMsg.includes("attempts")) {
          setError("Too many login attempts. Please try again in 10 minutes.");
        } else if (errorMsg.includes("verify")) {
          setError("Please verify your email before signing in");
        } else {
          // Default to invalid credentials for any auth failure
          setError("Invalid credentials");
        }
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const errorStr = String(error);
      if (errorStr.toLowerCase().includes("ratelimit") || errorStr.toLowerCase().includes("rate")) {
        setError("Too many login attempts. Please try again in 10 minutes.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">SecureGate</Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="field-row">
            <Link href="/forgot-password" className="link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link href="/signup" className="link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
