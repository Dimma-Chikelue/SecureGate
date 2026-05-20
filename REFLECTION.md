# REFLECTION.md — SecureGate Client Vault

## Engineering Decisions & Architectural Reasoning

---

## 1. Authentication Architecture

### Why NextAuth.js + Credentials Provider?
- **Decision:** Use NextAuth.js with custom Credentials provider instead of OAuth
- **Reasoning:** Project scope requires focused authentication control. Credentials provider gives complete ownership over user data flow without external dependencies. No need for social auth complexity.
- **Trade-off:** More setup required vs. built-in OAuth simplicity. Justified by security hardening and data privacy.

### Why JWT Sessions?
- **Decision:** JWT session strategy over database sessions
- **Reasoning:** Stateless authentication scales without session store overhead. Tokens contain user identity and verification status, reducing DB queries per request.
- **Risk:** Token revocation requires middleware validation. Mitigated by short expiry times and server-side verification.

---

## 2. Password & Token Security

### Why bcryptjs with 12 salt rounds?
- **Decision:** bcryptjs.hash(password, 12)
- **Reasoning:** Industry standard for password hashing. 12 rounds provides strong security-computation balance. Not reversible. Prevents rainbow table attacks.
- **Alternative considered:** SHA256 — rejected immediately. Not suitable for passwords (reversible, no salting).

### Why crypto.randomBytes(32) for tokens?
- **Decision:** 32-byte (256-bit) cryptographically secure random tokens
- **Reasoning:** Sufficient entropy for one-time tokens (verification, password reset). Hexadecimal encoding standard for transport in URLs.
- **Why not UUIDs:** UUIDs lack cryptographic entropy. Tokens must be unguessable.

### Token Expiry Strategy
- **Verification tokens:** 15 minutes
- **Password reset tokens:** 1 hour
- **Reasoning:** Short windows limit damage from leaked tokens. 15 min reasonable for email delivery. 1 hour standard for password reset workflows.
- **Implementation:** Delete used tokens immediately. Expired tokens auto-invalid on verification.

---

## 3. Rate Limiting Architecture

### Why Upstash Redis with fallback?
- **Decision:** Upstash REST API for distributed rate limiting, fallback to in-memory cache
- **Reasoning:** Upstash works serverless/edge without persistent connection. In-memory fallback enables local development without external services.
- **Limits chosen:**
  - Login: 5 attempts per 10 minutes per IP
  - Forgot password: 3 attempts per 10 minutes per IP
- **Reasoning:** Balances security against brute-force with UX (legitimate users won't hit limits).

### Why IP-based (not user-based)?
- **Decision:** Rate limit by IP for unauthenticated endpoints
- **Reasoning:** Unauthenticated users can't be identified reliably. IP-based prevents account enumeration + brute-force attacks on same endpoint.
- **Caveat:** Behind proxies, `x-forwarded-for` header required. Production infrastructure must trust this header.

---

## 4. Email Verification Flow

### Why email verification required?
- **Decision:** Users cannot access dashboard until email verified
- **Reasoning:** Ensures user owns email address. Prevents typo-based account lockout. Validates contact method for password recovery.
- **Alternative considered:** Optional verification — rejected. Security requirement in AGENTS.md.

### Why Resend for email?
- **Decision:** Resend email service + React Email templates
- **Reasoning:** Reliable email delivery. React Email allows component-based templates. Onboarding domain (`resend.dev`) works without custom domain setup.
- **Production concern:** Custom domain verification required before sending from gallery domain.

### Email Privacy in Error Messages
- **Decision:** Generic success messages for sign-up, forgot password, resend verification
- **Reasoning:** Prevents account enumeration attacks (cannot determine if email is registered).
- **Error:** "Invalid credentials" for login (never reveal email existence)
- **Success:** "If that email is registered, a reset link has been sent." (confirms action, masks email existence)

---

## 5. Database & ORM

### Why Prisma + Neon PostgreSQL?
- **Decision:** Prisma ORM with Neon serverless PostgreSQL
- **Reasoning:** 
  - Prisma: Type-safe queries, migrations, minimal boilerplate
  - Neon: Serverless (no connection management), AWS-backed, scales automatically
  - PostgreSQL: Battle-tested ACID compliance, JSON support, scalable
- **Alternative considered:** Firebase — rejected. Requires different auth model, lock-in.

### Minimal Schema Philosophy
- **Decision:** Only three models: User, VerificationToken, PasswordResetToken
- **Reasoning:** Avoids feature creep. Each model serves one purpose. No unnecessary fields.
- **No sessions table:** JWT handles sessions; no DB lookup needed.
- **No activity logs:** Out of scope per AGENTS.md.

### Transactions for Data Integrity
- **Decision:** db.$transaction() for multi-model operations
- **Usage:** User creation + token creation together
- **Reasoning:** Prevents orphaned tokens or users if operation fails mid-way.

---

## 6. Middleware & Route Protection

### Why Next.js Middleware?
- **Decision:** Protect /dashboard with middleware (not route handler)
- **Reasoning:** Middleware runs before page renders, preventing unauthorized content leakage. Faster redirect (no page load).
- **Logic:**
  - Check for valid JWT token
  - Verify emailVerified status
  - Redirect unauthenticated to /login
  - Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)

### Why Middleware for Rate Limiting?
- **Decision:** Login rate limiting in middleware (not action)
- **Reasoning:** Middleware intercepts requests before NextAuth processes credentials. Prevents expensive credential verification on attack traffic.

---

## 7. Form Validation

### Why Zod?
- **Decision:** Zod for all form validation (server + client)
- **Reasoning:** 
  - Type-safe schema definitions
  - Same validation logic client (real-time feedback) + server (security)
  - Composable schemas, clear error messages
- **Never trust client validation:** Server always re-validates

### Password Validation Rules
- Minimum 8 characters (NIST recommendation)
- Require character variety (uppercase, lowercase, number, or symbol)
- Maximum 100 characters (prevents DoS via hash computation)
- **Reasoning:** "Fair" strength enforced (no trivial passwords). Users can still choose memorable passwords.

---

## 8. Error Handling Philosophy

### Generic Error Messages for Auth Endpoints
- **Pattern:** "Invalid credentials" (never reveal specifics)
- **Why:** Prevents attacker from determining if email exists or if password was close
- **Exception:** Field-level validation errors (email format, password too short) — these are client-side constraints, not secrets

### Fail-Safe Email Delivery
- **Decision:** If email send fails, account still created but warning returned
- **Reasoning:** Email service outages shouldn't block account creation. Users can resend verification later.
- **Error messaging:** "Account created, but verification email failed. Please contact support."

### Server Error Logging
- **Pattern:** Log detailed errors to console (server-side)
- **Return to client:** Generic "Something went wrong. Please try again."
- **Reasoning:** Prevents information leakage. Admins can debug via logs.

---

## 9. Session & Token Callbacks

### Why Both JWT and Session Callbacks?
- **JWT callback:** Enriches token with user data (id, emailVerified)
- **Session callback:** Enriches session object with token data
- **Reasoning:** JWT callback runs on sign-in + token refresh. Session callback ensures client-side session always has latest data.
- **Update trigger:** Email verification can update token without forcing logout

---

## 10. Dashboard Implementation

### Minimal Dashboard Scope
- **Decision:** Mock delivery data, no backend CRUD
- **Reasoning:** Dashboard proves authentication works. Real delivery management is out of scope (AGENTS.md).
- **Content:** Welcome card, verified status badge, 4 mock artwork cards
- **Protection:** Requires valid session + emailVerified

### Mock Data Philosophy
- **Why not real data:** Project is auth-focused, not a gallery platform
- **Mock structure:** Mirrors what a real gallery might show (title, artist, status, date)

---

## 11. Deployment & Environment

### Why Vercel?
- **Decision:** Deploy on Vercel (no self-hosting)
- **Reasoning:** 
  - Next.js native (zero config)
  - Serverless functions scale automatically
  - Built-in middleware support
  - Free tier sufficient for demo
- **Environment:** Secrets stored in Vercel dashboard, not .env

### Environment Variables
- **Local:** .env.local (never committed)
- **Production:** Vercel environment settings
- **Required:** DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY, UPSTASH_REDIS credentials

### NEXTAUTH_SECRET Generation
- **Command:** `openssl rand -base64 32`
- **Why:** Must be cryptographically random. Not human-created strings.

---

## 12. Security Headers

### X-Frame-Options: DENY
- **Prevents:** Clickjacking attacks (page in iframe)
- **Why:** Auth pages should never be framed

### X-Content-Type-Options: nosniff
- **Prevents:** MIME type sniffing attacks
- **Why:** Browser won't guess content type if header says otherwise

### Referrer-Policy: strict-origin-when-cross-origin
- **Prevents:** Leaking full URL to third-party sites
- **Why:** Don't share auth tokens in referrer header

### No CSRF Token Needed (NextAuth Handles)
- **Reason:** NextAuth callbacks verify requests automatically

---

## 13. Code Organization

### Folder Structure Rationale
```
src/
  app/          # Next.js routes + pages
  actions/      # Server actions (form handlers)
  components/   # React components
  lib/          # Utilities, auth helpers, validators
  emails/       # Email templates
  middleware.ts # Route protection
```

### Why This Structure?
- **app/:** Clear routing hierarchy
- **actions/:** Isolated server logic, easier to mock/test
- **lib/:** Reusable helpers, not tied to routes
- **emails/:** Separate so they can be versioned/tested independently

### No `/utils` Folder
- **Decision:** Use `/lib` instead
- **Reasoning:** `/utils` often becomes a junk drawer. `/lib` implies "library of reusable code" — encourages better organization.

---

## 14. Testing & Validation Strategy

### No Automated Tests (MVP)
- **Why:** Time-constrained MVP. Deployment validation more critical than unit tests.
- **Manual validation checklist:**
  - Sign up with new email → verification email received → email verified → can login
  - Login with correct/incorrect credentials → rate limiting works
  - Forgot password → reset email → password changed → new password works
  - Dashboard access requires verified email
  - Logout clears session

### What Would Be Tested (If Time)
- Zod validation schemas
- bcryptjs hash/compare
- Token generation + expiry
- Rate limiting edge cases
- Middleware redirects

---

## 15. Known Limitations & Future Improvements

### Current Limitations
- Rate limiting IP-based (fails behind shared proxies)
- No email domain verification (Resend onboarding domain only)
- No two-factor authentication
- No password history (users can reuse old passwords)
- No account lockout (relies on rate limiting)
- No password strength meter stored (client-side only)

### Potential Improvements (Out of Scope)
- 2FA via TOTP authenticator
- Passwordless login (magic links)
- Social authentication (OAuth providers)
- Admin panel for user management
- Account activity logs
- Backup codes for account recovery
- Email change verification
- Session management (logout from all devices)

---

## 16. Why NOT Include
### Features Explicitly Excluded (YAGNI)
- File uploads (auth, not storage)
- Messaging (auth, not communication)
- Payment (out of scope)
- Multi-role permission system (single-user model)
- Notifications (out of scope)
- Search functionality (no data to search)
- Notifications (email-only, built-in)
- Analytics (out of scope)
- AI/ML features (out of scope)

### Why YAGNI Matters Here
- Scope creep kills projects
- Each feature adds complexity, vulnerabilities, maintenance burden
- MVP must be focused, deliverable, secure
- Better to ship 100% of auth correctly than 80% of auth + 50% of extras

---

## 17. Design Decisions

### Dark Theme
- **Decision:** Dark-mode-first UI
- **Reasoning:** Premium, trustworthy aesthetic. Secure/vault-like feel. Reduces eye strain for extended sessions.

### Minimal, Modern UI
- **Design:** No gradients, no animations (except loading states)
- **Colors:** Blue (trust), Red (errors/warnings), Gray (neutral)
- **Typography:** Clean sans-serif (Geist), consistent sizing

### No Complex Components
- **Decision:** Forms, buttons, alerts only
- **Reasoning:** Focus on UX clarity, not flashiness. Security product shouldn't feel "designed-to-death."

---

## 18. Deployment Checklist Before Production

- [ ] Database migrated to Neon (verified schema)
- [ ] Resend domain verified (not onboarding domain)
- [ ] NEXTAUTH_URL set to production URL
- [ ] NEXTAUTH_SECRET generated via `openssl rand -base64 32`
- [ ] All env vars set in Vercel dashboard (not committed)
- [ ] Database backup strategy confirmed
- [ ] Rate limiting tested against actual traffic
- [ ] Email delivery tested (verification + password reset)
- [ ] Security headers verified in browser DevTools
- [ ] Redirect chains tested (signup → verify → login → dashboard)
- [ ] Error messages verified (no leakage of internal state)
- [ ] Session timeout tested (token expiry, logout)

---

## 19. Why This Project Matters

**SecureGate demonstrates:**
1. **Security-first thinking** — Every decision considers attack vectors
2. **Practical engineering** — Balances security with usability
3. **Scope discipline** — Ships focused, polished MVP over bloated platform
4. **Code quality** — Intentional architecture, not copy-paste
5. **Production-readiness** — Error handling, rate limiting, monitoring

**Not just another auth starter.** This is a **secure, intentional, deliverable auth system.**

