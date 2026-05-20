import { verifyEmail } from "@/actions/verify-email";
import Link from "next/link";

interface Props {
  params: { token: string };
}

export default async function VerifyEmailPage({ params }: Props) {
  const result = await verifyEmail(params.token);

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-narrow">
        <Link href="/" className="auth-logo">SecureGate</Link>

        {result?.success ? (
          <>
            <div className="status-icon status-success">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="auth-title">Email verified</h1>
            <p className="auth-subtitle">
              {result.success || "Your email has been verified successfully."}
            </p>
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </>
        ) : (
          <>
            <div className="status-icon status-error">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h1 className="auth-title">Verification failed</h1>
            <p className="auth-subtitle">{result?.error}</p>
            <Link href="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
