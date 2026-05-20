import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="logo">SecureGate</div>
        <nav className="landing-nav">
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/signup" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>
      <main className="landing-main">
        <section className="hero">
          <span className="hero-badge">Client Access Portal</span>
          <h1 className="hero-title">
            Your secure<br />vault for delivered<br />artwork.
          </h1>
          <p className="hero-subtitle">
            Protected access to your curated collection. Authenticated.
            Verified. Secure.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </section>
        <section className="features">
          <div className="feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>End-to-End Security</h3>
            <p>Industry-standard encryption protects every interaction.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Identity Verified</h3>
            <p>Email verification ensures only authorized access.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>24/7 Access</h3>
            <p>Your collection is available whenever you need it.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
