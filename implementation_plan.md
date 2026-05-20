# Phase 1: Scaffold & Database Schema

This plan covers the initialization of the Next.js 14 project, the installation of Prisma, and the setup of the required database schema.

## User Review Required

> [!IMPORTANT]
> **Database Credentials Needed:** In order to run the Prisma migration and verify the tables as requested, I will need you to provide your Neon PostgreSQL connection string. You can either paste it in your next message (so I can put it in `.env` and run the migration), OR you can put it in `.env` yourself and I will run the migration afterward.

> [!NOTE]
> Per the project guidelines, I am using Vanilla CSS and avoiding TailwindCSS. 

## Open Questions

1. Do you want to provide the Neon `DATABASE_URL` now so I can run the migration, or would you prefer to configure it locally yourself before I execute the migration step?
2. By default, I will use `npm` as the package manager. Let me know if you prefer `pnpm` or `yarn`.

## Proposed Changes

### 1. Scaffolding Next.js
I will initialize the project using the Next.js 14 CLI directly in the current directory (`c:\Users\HP\Desktop\SecureGate`) with the following settings:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: No (using Vanilla CSS as requested by default system guidelines)
- `src/` directory: Yes (matches folder architecture in `AGENTS.md`)
- App Router: Yes
- Import alias: `@/*`

### 2. Prisma Initialization
- Install `prisma` as a dev dependency and `@prisma/client` as a regular dependency.
- Run `npx prisma init` to create the `prisma/schema.prisma` file.

### 3. Database Schema Creation
I will define the following models in `schema.prisma`:

#### `User`
- `id` (String, CUID, primary key)
- `name` (String, optional)
- `email` (String, unique)
- `password` (String, for the hashed bcrypt password)
- `emailVerified` (DateTime, optional)
- `createdAt` (DateTime, default now)

#### `VerificationToken`
- `identifier` (String)
- `token` (String, unique)
- `expires` (DateTime)
- Composite primary key on `[identifier, token]`

#### `PasswordResetToken`
- `email` (String)
- `token` (String, unique)
- `expires` (DateTime)
- Composite primary key on `[email, token]` or just an id + unique token.

### 4. Migration Execution
- Once the schema is ready and the `DATABASE_URL` is configured in `.env`, I will run `npx prisma db push` (or `migrate dev`) to sync the schema to your Neon database.
- Finally, I will verify the tables have been created successfully.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify TypeScript builds successfully.
- Run `npx prisma validate` to ensure the schema syntax is correct.

### Manual Verification
- Review the file structure to ensure the `src/` directory and Next.js scaffolding match expectations.
- Check the Neon console to confirm the tables (`User`, `VerificationToken`, `PasswordResetToken`) are present.
