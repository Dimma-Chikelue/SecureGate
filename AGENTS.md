# AGENTS.md — SecureGate Client Vault

## 1. Project Identity

### Product Name
SecureGate Client Vault

### Product Type
Focused Authentication & Security System

### Project Goal
Build a production-oriented authentication layer for a digital art gallery client portal.

This is NOT a full SaaS product.

This is NOT a gallery management system.

This project exists to demonstrate:

- Authentication architecture
- Identity verification
- Account recovery
- Route protection
- Security hardening
- Engineering discipline
- Clean UX execution

The app should feel like a secure client access portal for delivered artwork.

---

# 2. Core Product Principle

SecureGate is an AUTH system.

Security is the product.

Do not treat authentication as a supporting feature.

Do not build unnecessary platform functionality.

Every decision must reinforce:

- trust
- protection
- access control
- reliability

---

# 3. Scope Guardrails (Critical)

## In Scope

Build ONLY:

### Authentication
- Sign Up
- Login
- Logout
- Session handling

### Verification
- Email verification
- Verification resend
- Token expiry

### Recovery
- Forgot password
- Reset password
- Token expiry

### Protection
- Protected dashboard
- Redirect handling
- Verified-user access checks

### Security
- Password hashing
- Rate limiting
- Secure validation
- Security-safe error messaging
- Security headers
- Environment variables

### Dashboard
Simple protected dashboard only.

Purpose:

Demonstrate successful protected access.

Dashboard may use mock delivery data.

---

## Out of Scope (Do Not Build)

Do NOT add:

- File upload
- Artwork upload
- Messaging
- Admin panel
- Payment
- Social login
- OAuth providers
- Multi-factor authentication
- Role management
- Notifications
- Activity feed
- Collaboration
- Analytics
- Real gallery management
- Search
- Settings system
- CMS features
- AI features
- Anything not required by SecureGate

Avoid feature creep.

YAGNI applies.

---

# 4. Engineering Philosophy

Build like Murphy is testing the system.

Assume:

- invalid input
- malicious users
- expired tokens
- deleted sessions
- broken links
- brute-force attempts
- empty forms
- network failure

Never trust client input.

Validate on server.

Fail safely.

Protect user privacy.

---

# 5. Design Direction

Visual tone:

Premium secure client vault.

Not fintech.

Not cyberpunk.

Not playful.

Keywords:

- minimal
- trustworthy
- premium
- modern
- dark elegance
- quiet confidence

UI should communicate:

"This space is secure."

---

# 6. User Model

Single user type.

## Gallery Client

A client accessing delivered artwork.

User goals:

- create account
- verify identity
- login securely
- recover account
- access dashboard

No admin role.

No multiple permissions.

Single-user system.

---

# 7. Required Screens

Build these routes only.

```text
/
├── login
├── signup
├── verify-email/[token]
├── forgot-password
├── reset-password/[token]
└── dashboard
```

Dashboard requires:

- authenticated session
- verified email

Otherwise redirect.

---

# 8. Technical Stack

Use:

Framework:
- Next.js 14 App Router

Language:
- TypeScript

ORM:
- Prisma

Database:
- PostgreSQL

Authentication:
- NextAuth/Auth.js

Password Hashing:
- bcryptjs

Validation:
- Zod

Email:
- Resend
- React Email

Security:
- Upstash Rate Limit or custom middleware

Deployment:
- Vercel

Version Control:
- GitHub

Do not substitute stack without necessity.

---

# 9. Database Models

Minimum schema:

## User

Fields:

- id
- name
- email
- password
- emailVerified
- createdAt

Passwords must NEVER be plain text.

Hash with bcryptjs.

Salt rounds:

12

---

## VerificationToken

Fields:

- identifier
- token
- expires

Expiry:

15 minutes

---

## PasswordResetToken

Fields:

- email
- token
- expires

Expiry:

1 hour

Delete used tokens.

Delete expired tokens when appropriate.

---

# 10. Authentication Rules

## Sign Up

Requirements:

- Zod validation
- Hash password
- Create user
- Generate verification token
- Send email

Do not auto-login unverified users.

---

## Login

Requirements:

- Credentials provider
- bcrypt.compare()
- NextAuth session

Error handling:

Do NOT reveal:

- email existence
- password correctness
- database errors

Allowed message:

"Invalid credentials"

Keep errors generic.

---

## Email Verification

Generate:

crypto.randomBytes(32)

Token:

hex string

Flow:

- verify token
- check expiry
- mark verified
- delete token

If invalid:

- clear error
- resend option

---

## Forgot Password

Must:

- accept email
- generate token
- send email
- return generic response

Never confirm:

whether email exists.

Protect privacy.

---

## Reset Password

Must:

- validate token
- check expiry
- accept new password
- hash password
- delete token
- redirect login

---

## Logout

Must:

- destroy session
- redirect login

Clean session termination.

---

# 11. Security Rules (Non-Negotiable)

## Password Security

Use:

bcrypt.hash(password, 12)

Never:

- SHA256
- reversible encryption
- plain text

---

## Rate Limiting

Protect:

Login:

5 attempts

per IP

per 10 minutes

Also protect:

forgot-password

Return safe errors.

---

## Environment Variables

Use:

.env.local

Never commit.

Required:

DATABASE_URL

NEXTAUTH_SECRET

NEXTAUTH_URL

RESEND_API_KEY

UPSTASH_REDIS_REST_URL

UPSTASH_REDIS_REST_TOKEN

No hardcoded secrets.

Ever.

---

## Security Headers

Add:

- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

---

# 12. UX Rules

Forms must include:

- labels
- loading states
- validation
- success feedback
- accessible interaction

No vague UX.

Avoid:

"Something went wrong"

Prefer:

specific but safe messaging.

Password field:

show strength:

- weak
- fair
- strong

based on:

- length
- character variety

---

# 13. Dashboard Rules

Dashboard is NOT product scope.

Keep lightweight.

Purpose:

prove access protection.

Suggested content:

## Client Vault

- welcome card
- mock delivery list
- project cards
- account verified status
- logout

No complex features.

No CRUD.

No backend-heavy dashboard logic.

---

# 14. Folder Architecture Preference

Prefer:

```text
src/
  app/
  components/
  lib/
  actions/
  emails/
  middleware/
  prisma/
  types/
```

Keep:

- separation of concerns
- reusable logic
- low duplication

Avoid spaghetti routes.

---

# 15. Code Quality Expectations

Prefer:

- reusable helpers
- typed functions
- small components
- clean naming
- readable logic

Avoid:

- duplicated validation
- giant route handlers
- hardcoded values
- unclear naming
- dead code

Apply Boy Scout Rule.

Leave code cleaner.

---

# 16. Reflection Awareness

This project requires REFLECTION.md.

Code decisions must be explainable.

Build intentionally.

Be able to explain:

- why
- where
- what breaks if ignored

Do not build blindly.

Engineering reasoning matters.

---

# 17. Final Definition of Done

Project is complete only when:

✓ Sign up works

✓ Email verification works

✓ Login works

✓ Dashboard protected

✓ Forgot password works

✓ Reset password works

✓ Logout works

✓ Passwords hashed

✓ Tokens expire

✓ Rate limiting active

✓ Security headers active

✓ Env vars configured

✓ Deployed to Vercel

✓ GitHub repo clean

✓ REFLECTION.md complete

Ship small.

Ship secure.

Ship intentionally.