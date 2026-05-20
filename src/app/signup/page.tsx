"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/register";

function getPasswordStrength(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", score: 0 };
  if (score <= 4) return { label: "Fair", score: 1 };
  return { label: "Strong", score: 2 };
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const strength = getPasswordStrength(passwordValue);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);
    const errMsg = "error" in result ? result.error : undefined;

    if (errMsg) {
      setError(errMsg);
      setLoading(false);
      return;
    }

    router.push(`/login?verified=pending`);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">SecureGate</Link>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Secure access to your gallery</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              autoComplete="name"
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name[0]}</span>}
          </div>

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
            {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
            {passwordValue && (
              <div className="password-strength">
                <div className={`strength-bar strength-${strength.label.toLowerCase()}`} />
                <span className={`strength-label ${strength.label.toLowerCase()}`}>
                  {strength.label}
                </span>
              </div>
            )}
            {fieldErrors.password && <span className="field-error">{fieldErrors.password[0]}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link href="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
