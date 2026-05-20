# REFLECTION.md — SecureGate Client Vault

 Engineering Decisions & Architectural Reasoning

Name: chidimma success onwuokwu
cohort: design to MVP bootcamp
Live URL:https://secure-gate-dvok.vercel.app
GitHub Repo: https://github.com/Dimma-Chikelue/SecureGate



Part 1 — What I Built

SecureGate is a client access/authentication system for an art delivery platforms. when artwork is delivered, the client receives  access to SecureGate where all of their purchased collection is stored digitally 

TECH STACK:
Next.js 14(App Router)+ TypeScript
PostgreSQL
NextAuth for session management
Upstash Redis for rate limiting
Deployed/hosted on vercel

 I implemented sign up with email verification via Resend, login with session handling, a forgot/reset password flow, a protected dashboard that only verified users can access, and a password strength indicator on the sign up form. The app is deployed to Vercel with all secrets stored as environment variables — never hardcoded.

WHAT SURPRISED ME/WHAT I LEARNT

The hardest part was not the auth logic itself, it was keeping the app stable while building it. Throughout the night, I dealt with a client-side exception error that would crash the page after about a second of loading. It turned out to be a missing Suspense boundary around a component that was reading from the URL during server rendering. Fixing that took longer than I expected because the error message pointed nowhere near the actual problem. My agent hallucinated at some point and i had trouble install NPM. it keptgetting corrupted due to terible network connections caused by the poor weather.
 sp yeah...Next.js App Router is very strict about where async operations happen, the error surface is not always honest about the root cause, never vibecode with a bad fluctuating network and always verify every action suggested by your agent before accepting(i used claude in my case. I'd take screenshots of what my agent thinks is the problem and asked claude to verify or direction on how to instruct my agent)



 — ENGINEERING LAW QUIZ

 Q1 — Murphy's Law
Code reference: src/app/api/auth/[...nextauth]/route.ts and src/app/api/auth/forgot-password/route.ts`

 Murphy's Law forced me to add protection in three places I did not initially think about. The first was rate limiting on the login endpoint. I originally thought a wrong password error was enough, but if you leave login open without limits, an attacker can run thousands of attempts and the probability of getting it increases with each attempt.Another protection i added was displaying "wrong credentials" instead of "wrong password or wrong email". i leaves any attacker clueless as to which of the credentials is wrong. I also added a counter so after five failed wrong password attempts, the endpoint blocks further tries. The second was token expiry on the password reset flow. I initially generated a reset token without thinking about how long it should live. Murphy's Law says a user will click that link three days later, or an attacker will try to reuse it. I set a one-hour expiry and delete the token immediately after it is used.
-Also the app worked locally but deploying to vercel made me discover errors that i initially ignored

What goes wrong if ignored: Without rate limiting, ambiguous credential login error messages,brute force attacks will succeed silently. Without token expiry, reset links become permanent backdoors into user accounts.



Q2 — LAW OF LEAKY ABSTRACTION
Code reference: src/app/api/auth/[...nextauth]/route.ts — the `authorize() callback

**My Answer: Resend leaked on me. when i tested with a different email address during sign up and forgot password. The API call succeeded.my code had no errors, but the email never arrived.I only found out when i googled it/asked claude. I now understand that Resend's free tier restricts delivery to verified email addresses only. Something my agent never told me. it did save me impending minutes or even possibly hours of frustration

What goes wrong if ignored: SecureGate users would sign up with their real email, the verification link will never arrive, and they'll be permanently stuck; they can't verify their account, can't access the dashboard, and have no idea why
Another set of users would request a password reset, nothing arrives, and they're locked out of their account forever with no way back in
and me as the developer, will not see any errors in my logs, so i'll think everything is working perfectly while my users are frustrated and leaving



 Q3 — YAGNI
Code reference: Overall project scope: No social media or email login, no MFA, no audit logs implemented

**My Answer:** Adding social login, multi-factor auth, or audit logs right now would violate YAGNI because none of them are required by this task, and each one introduces real complexity. Social login means OAuth flows, provider tokens, account linking logic, and edge cases around email collisions. MFA means a second factor delivery system and recovery flows. Audit logs mean a separate logging table and careful thought about what constitutes an auditable event. None of that complexity serves the current requirement of SecureGate, which is to demonstrate a solid, secure credentials-based auth system. If I added these features now, they would be undertested, likely broken, and would make it harder to debug the core features that are actually being assessed. The right way to add them later is phase by phase: a feature after another; social login only after the credentials flow is proven stable, MFA only after email delivery is reliable, audit logs only when there is a real compliance or debugging need.

What goes wrong if ignored: half-built features will be shipped and  that introduce new attack surfaces. A broken OAuth flow is worse than no OAuth flow.


4 . Kerckhoffs's Principle (Password Hashing)
Code reference: `src/app/api/auth/register/route.ts-bcrypt.hash(password, 12) and .env.local

My Answer: Kerckhoffs's Principle basically means your system should still be secure even if everyone can see how you built it. The security comes from your secrets: your passwords, tokens, API keys and not exactly from hiding the code.
In SecureGate, i used bcrypt to hash passwords. Even if someone reads my code and sees the used bcrypt.hash(password, 12), it tells them nothing useful. They still can't reverse the hash to get the original password. The security is in the hash itself, not in keeping my hashing method a secret.
Same thing with my API keys and NEXTAUTH_SECRET, i stored them in environment variables, not in the code. My GitHub repo can be fully public and it doesn't matter, because the actual secrets never appear in the code.

**What goes wrong if ignored: If you rely on hiding your code for security like eg, hardcoding an API key but keeping the repo private, you're one accident away from everything collapsing. The moment someone sees your code,the entire security is gone. Real security has to hold up even when the attacker knows exactly how you built it.



Q5 — Security by Design (Forgot Password)
Code reference: src/app/api/auth/forgot-password/route.ts`

My Answer: The forgot password endpoint always returns the same success message "If that email exists, a reset link has been sent" regardless of whether the email is actually in the database. This is deliberate.The principle here is that the security of the system must not depend on the attacker not knowing how it works what matters is that the response itself leaks nothing.

What goes wrong if ignored: Your forgot password page becomes a free tool for discovering which emails are registered on your platform.



 Q6 — The Boy Scout Rule
Code reference: src/components/auth/

**My Answer: The Boy Scout Rule says leave the code better than you found it. While I was working on other parts of SecureGate, I noticed two things that weren't part of my original plan — unused imports scattered across files and duplicated code doing the same thing in multiple places. I stopped and cleaned both up. The unused imports were cluttering files and making it harder to read what was actually being used. The duplicated code meant if I needed to change something, I'd have to change it in multiple places and risk missing one. I merged it so the logic lived in one place only.

What goes wrong if ignored: Unused imports seem harmless but they add noise that makes code harder to read and debug. Duplicated code is more dangerous — it drifts apart over time. You fix a bug in one place and leave it in another without realising. The codebase becomes inconsistent and harder to trust the longer it grows.



Q7 — Gall's Law
Code reference: Gnpx tsc --noEmit in terminal

**My Answer: SecureGate grew exactly the way Gall's Law describes it,from a simple system that worked to a more complex one. My TypeScript errors that kept blocking my Vercel deployments. Because I had built in phases, I knew exactly which layer the errors were coming from and it was specific TypeScript issues in my components. I ran npx tsc --noEmit locally to catch them, fixed them, and redeployed. It took 3 deployments before it finally went through.

What goes wrong if ignored: building everything simultaneously, one TypeScript error could be coming from anywhere. i would have been blinded with no stable layer to stand on while fixing it. Bugs will compound on top of each other and the whole thing becomes impossible to untangle.


Q8 — Leaky Abstractions (Prisma + PostgreSQL)
**Code reference: prisma/schema.prisma and Database_url

My Answer: I used Neon to generate my PostgreSQL database and connected it to Prisma via the DATABASE_URL environment variable. Everything worked fine, but the abstraction is still there — Prisma shows me a verificationTokens field on my User model in TypeScript that doesn't actually exist as a column in my Neon database. Prisma generates it virtually behind the scenes using a foreign key.

What goes wrong if ignored: If you step outside Prisma and write raw SQL expecting that field to exist in your Neon database, it won't be there. You'd get errors you can't explain because you trusted what Prisma showed you in TypeScript instead of what the actual database contains.


 Q9 — Zawinski's Law (Rate Limiting)
Code reference: src/middleware.ts AND src/app/api/auth/signin/route.ts — rate limit logic

**My Answer:** Rate limiting is a separate concern that i had to add explicitly using Upstash Redis because no framework i was using thought it was their job to include it. i learnt that the Single Responsibility Principle is that each tool does one thing. But Zawinski's Law warns about what happens when you ignore those boundaries and keep adding features to a single system. If Next.js tried to handle rate limiting, email sending, and payments as built-in features, it would become bloated and unmaintainable. The right architecture is composable tools, each doing one job well, assembled deliberately by the engineer.

What goes wrong if ignored: Apps that try to do everything themselves become impossible to maintain and impossible to replace one part of without breaking everything else.



Q10 — Principle of Least Surprise (Error Messages)
Code reference: src/app/login/page.tsx — error display logic

My Answer: The Principle of Least Surprise says software should behave the way a reasonable user expects. For SecureGate specifically, I chose to show "Invalid credentials" instead of "Wrong email" or "Wrong password" separately. The reason is the nature of the product. SecureGate is a secure vault for private art collections. A client accessing it expects tight security. Splitting the error into two separate messages would actually surprise a security-conscious user and help an attacker narrow down whether the email exists or the password is wrong. One combined message is exactly what a user of a secure vault would expect to see.

What goes wrong if ignored: If you show separate error messages for wrong email versus wrong password, you're cutting the attacker's work in half. They now know which field is correct and only need to crack the other one. In a product built around security and privacy, that's a serious gap.



Q11 — Murphy's Law + Defensive Programming (Dashboard Protection)
Code reference:`src/middleware.ts — session check and redirect logic

My Answer: SecureGate's dashboard is completely locked. If you're not logged in, you can't get in. If you're logged in but haven't verified your email, you still can't get in. The middleware checks your session on every single request to /dashboard. if anything is missing or invalid, it immediately redirects you to login. No flash of the page or partial load. I tested this myself, logging out and trying to go directly to /dashboard in the browser sends you straight back to login every time.

What goes wrong if ignored:If you trust the client to handle access control instead of enforcing it on the server, a user can simply delete their cookie or manipulate the URL and land on protected pages. Murphy's Law says assume someone will try exactly that. The middleware assumes the worst on every request and never lets anything through without a valid, verified session.



Q12 — KERCKHOFF's PRINCIPLE (Leaked Secret Recovery)
Code reference: `.env.local and .gitignore

My Answer: I stored all my secrets: NEXTAUTH_SECRET,DATABASE_URL, RESEND_API_KEY,UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN  in a .env.local file and added it to .gitignore immediately before my first push. None of my secrets ever touched GitHub. On Vercel, I set all the same variables through the environment variables dashboard so the production app could access them without them ever appearing in the code.
If NEXTAUTH_SECRET was accidentally committed, the recovery would be: generate a new secret immediately, update it in Vercel and redeploy, which invalidates all existing sessions and logs everyone out. Then scrub the secret from Git history using BFG Repo Cleaner and force push.

What goes wrong if ignored: A leaked NEXTAUTH_SECRET means anyone can forge valid session tokens for any user without knowing their password. A leaked RESEND_API_KEY means someone can send emails from your domain. A leaked DATABASE_URL means direct access to every user's data. One accidental commit and everything is compromised.



 Q13 — Conway's Law (Folder Structure)
Code reference: `src/app/ — route-based folder structure

My Answer: Conway's Law says a system's structure mirrors the thinking of the people who built it. In my case, my AI agent scaffolded the folder structure, which is interesting in itself. the agent organised the code the way it was trained to think about full stack Next.js apps. Auth routes together, components together, API routes together. As a solo developer i kept that structure because it matched how i was reasoning about the app when something broke in the email flow i knew exactly which folder to open, and when the dashboard protection wasn't working i went straight to middleware.

What goes wrong if ignored: A folder structure that doesn't match how you think about the system means you're constantly hunting for files in the wrong places. On a team it's worse, if the structure doesn't reflect how the team communicates, different people organise things differently and the codebase becomes inconsistent and hard to navigate.


Q14 — Technical Debt
Code reference: src/app/api/auth/[...nextauth]/route.ts — error handling in `authorize()

My Answer: The technical debt I am carrying is in how the rate limit error message surfaces to the user. Right now, when a user hits the rate limit on login,it returns a blocked response, but the error message the user sees says "Something went wrong, please try again later" instead of "Too many attempts, please try again in 10 minutes." The logic is correct, but the message is not specific enough. I left it this way because I ran out of time to trace exactly how NextAuth passes custom error strings from `authorize()` back to the client-side error handler. The refactored version would look like this:

CURRENT DEBT):
```ts
if (isRateLimited) {
  throw new Error("Too many attempts");
}
```

**Refactored:**
```ts
if (isRateLimited) {
  throw new Error("RATE_LIMITED");
}
// Then in the login page:
const errorMessages: Record<string, string> = {
  RATE_LIMITED: "Too many login attempts. Please try again in 10 minutes.",
  CredentialsSignin: "Invalid email or password.",
};
const displayError = errorMessages[error] ?? "Something went wrong.";
```

This maps internal error codes to user-facing messages cleanly and makes it easy to add new error types without touching the UI logic again.

**What goes wrong if ignored:** As more error types are added, the generic "something went wrong" message covers all of them and users have no way to know what they should actually do next.



 Q15 — SYNTHESIS: ADDING FLUTTERWAVE PAYMENTS.
Code reference: All of the above principles apply

My Answer: Adding Flutterwave payment integration to SecureGate would not change the engineering principles, rather it would make all of them more critical because real money is involved. Murphy's Law becomes critical immediately: Networks fail mid-transaction, users close the tab while paying, webhooks arrive twice or out of order. Every one of those scenarios needs to be handled explicitly or someone gets charged without access, or gets access without being charged. Every edge case must be handled explicitly. 
Kerckhoffs's Principle means the Flutterwave secret key must live in environment variables, never in code. A leaked payment key is a direct financial liability. The forgot-password principle of not leaking information will apply to payment errors too.Users will not be told a reason their card declined in a way that reveals whether it was fraud detection or insufficient funds.
YAGNI: subscription tiers, invoicing, or refund flowswill not be built until they are actually needed. 
Gall's Law says add payments as a separate, tested layer on top of working auth — do not entangle them. The most critical principle when money is involved is idempotency: making sure a user can't be charged twice for the same thing.
 Every payment attempt wil get a unique reference that gets checked before processing.



Part 4 — ONE THING I WOULD REFACTOR

The rate limit error message flow is the clearest piece of technical debt in the codebase. The block logic works correctly, after five failed login attempts the endpoint stops processing, but the message the user receives is too generic to be useful. A user who has genuinely forgotten their password and tries five times deserves to know exactly how long they need to wait, not a vague "please try again later." The refactor involves mapping internal error codes to specific user-facing strings in the login page component, as described in Q14 above.


 Part 5 — How This Changes How I Build

Before this task I trusted my AI agent completely. Whatever it suggested, i accepted. I assumed it knew best.
This task changed that. My agent hallucinated at somepoint during the build costing me time and tokens. At one point I had to switch tools entirely because of it. I also had npm install issues where partial installs corrupted my files, partly because I was accepting package suggestions without fully understanding what they were doingbut mostly cause i had network fluctuations.
Now i know that an AI agent is a powerful tool but not an infallible one. Before accepting any package installation i'll now check what it actually does. The agent scaffolded my folder structure and wrote a lot, but the bugs it couldn't completely fix, I had to understand deeply enough to fix myself.
Authentication specifically taught me that security is not a feature you add, it's a mindset. You have to think like an attacker, assume things will go wrong, and build protection before you need it. No amount of 'fix" would have made my agent think that way. I had to