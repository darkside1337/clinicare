# Implementation Plan: Phase 1 — Database Schema & ORM

## Objective
Establish the persistence layer for CliniCare: configure the Drizzle ORM client, generate the Better Auth schema with multi-tenant custom fields (`clinicId`, `role`), define all domain tables matching the PRD data model, generate and run a unified migration against Supabase Postgres, seed development fixtures, and verify schema integrity with unit tests.

---

## 1. Architectural Alignment & Constraints

Per [`docs/ROADMAP.md`](file:///home/darkside/projects/clinicare/docs/ROADMAP.md#L99-L158), [`docs/PRD.md §9`](file:///home/darkside/projects/clinicare/docs/PRD.md#L170-L208), and [`docs/ARCHITECTURE.md`](file:///home/darkside/projects/clinicare/docs/ARCHITECTURE.md#L9-L44):
- **Unified Schema Single Migration:** Better Auth's generated schema (`user`, `session`, `account`, `verification`) and CliniCare's domain tables (`clinics`, `patients`, `allergies`, `problems`, `appointments`, `consultations`, `prescriptions`, `prescriptionItems`) are co-located in [`lib/db/schema.ts`](file:///home/darkside/projects/clinicare/lib/db/schema.ts) so Drizzle migrations stay completely synchronized.
- **No Separate `users` Table:** Doctors and receptionists are stored directly in Better Auth's generated `user` table with `clinic_id` (FK → `clinics.id`) and `role` (`doctor | receptionist`) defined via `user.additionalFields`. Foreign keys on `appointments.doctorId` and `consultations.doctorId` reference `user.id`.
- **Driver & Connection Pooling:** Next.js requires connection pooling via `DATABASE_URL` (Supabase transaction pooler port 6543) for runtime queries, and `DIRECT_URL` (direct port 5432) for Drizzle Kit schema migrations. We will install the standard `postgres` driver (Postgres.js) for Drizzle ORM.
- **Lightweight Unit Testing:** Tests in [`lib/db/__tests__/schema.test.ts`](file:///home/darkside/projects/clinicare/lib/db/__tests__/schema.test.ts) test schema exports and compile-time types with Vitest `expectTypeOf`.

---

## 2. Step-by-Step Execution Plan

### Step 1: Install PostgreSQL Driver & Configure Database Client Scripts
1. **Install runtime driver:**
   ```bash
   pnpm add postgres
   ```
2. **Add database scripts to [`package.json`](file:///home/darkside/projects/clinicare/package.json):**
   ```json
   "db:generate": "drizzle-kit generate",
   "db:migrate": "drizzle-kit migrate",
   "db:seed": "tsx lib/db/seed.ts"
   ```

### Step 2: Drizzle Client & Configuration
1. **Create [`lib/db/client.ts`](file:///home/darkside/projects/clinicare/lib/db/client.ts):**
   - Implement singleton connection using `postgres` and `drizzle-orm/postgres-js` with `globalThis` caching to prevent connection exhaustion during Next.js hot module reloading.
   - Attach unified schema to Drizzle instance for relational queries:
     ```ts
     import { drizzle } from "drizzle-orm/postgres-js";
     import postgres from "postgres";
     import * as schema from "./schema";

     const connectionString = process.env.DATABASE_URL!;
     // singleton client setup
     export const client = postgres(connectionString, { prepare: false });
     export const db = drizzle(client, { schema });
     ```
2. **Create [`drizzle.config.ts`](file:///home/darkside/projects/clinicare/drizzle.config.ts) at project root:**
   - Configure Drizzle Kit pointing to `./lib/db/schema.ts`, dialect `postgresql`, and `dbCredentials.url` set to `process.env.DIRECT_URL!`.

### Step 3: Better Auth Configuration (First Pass)
1. **Create [`lib/auth/auth.ts`](file:///home/darkside/projects/clinicare/lib/auth/auth.ts):**
   - Initialize Better Auth with `drizzleAdapter(db, { provider: "pg" })`.
   - Configure GitHub and Google OAuth providers using `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.
   - Configure `user.additionalFields`:
     - `clinicId`: string, references `clinics.id`
     - `role`: string enum (`"doctor" | "receptionist"`)

### Step 4: Generate Better Auth Schema via CLI
1. Run Better Auth CLI generate command:
   ```bash
   pnpm exec @better-auth/cli generate --config lib/auth/auth.ts --output lib/db/auth-schema.ts
   ```
2. Inspect [`lib/db/auth-schema.ts`](file:///home/darkside/projects/clinicare/lib/db/auth-schema.ts) to confirm generation of `user`, `session`, `account`, and `verification` tables with the additional `clinicId` and `role` columns.

### Step 5: Unified Domain Schema ([`lib/db/schema.ts`](file:///home/darkside/projects/clinicare/lib/db/schema.ts))
1. Re-export all auth tables:
   ```ts
   export * from "./auth-schema";
   ```
2. Define domain enums and tables matching `PRD.md §9` and `ROADMAP.md §1.4`:
   - Enums:
     - `allergySeverityEnum`: `'mild' | 'moderate' | 'severe'`
     - `problemStatusEnum`: `'active' | 'resolved'`
     - `appointmentStatusEnum`: `'scheduled' | 'checked-in' | 'completed' | 'no-show' | cancelled'`
     - `userRoleEnum`: `'doctor' | 'receptionist'`
   - Tables:
     - `clinics`: `id` (text PK), `name` (text), `logoUrl` (text nullable), `createdAt` (timestamp default now)
     - `patients`: `id` (text PK), `clinicId` (FK → `clinics.id`), `name` (text), `dob` (text/date), `sex` (text), `phone` (text), `email` (text), `address` (text), `deletedAt` (timestamp nullable), `createdAt`, `updatedAt`
     - `allergies`: `id` (text PK), `patientId` (FK → `patients.id` cascade), `substance` (text), `severity` (`allergySeverityEnum`), `reaction` (text), `createdAt`
     - `problems`: `id` (text PK), `patientId` (FK → `patients.id` cascade), `condition` (text), `status` (`problemStatusEnum`), `onsetDate` (text), `createdAt`
     - `appointments`: `id` (text PK), `clinicId` (FK → `clinics.id`), `patientId` (FK → `patients.id`), `doctorId` (FK → `user.id`), `scheduledAt` (timestamp), `status` (`appointmentStatusEnum`), `isWalkIn` (boolean default false), `reason` (text), `createdAt`
     - `consultations`: `id` (text PK), `patientId` (FK → `patients.id`), `doctorId` (FK → `user.id`), `appointmentId` (text unique FK → `appointments.id`), `chiefComplaint`, `symptoms`, `observations`, `diagnosis`, `treatment`, `notes`, `createdAt`, `updatedAt`
     - `prescriptions`: `id` (text PK), `consultationId` (FK → `consultations.id` cascade), `createdAt`
     - `prescriptionItems`: `id` (text PK), `prescriptionId` (FK → `prescriptions.id` cascade), `medication`, `dosage`, `frequency`, `duration`, `instructions`
3. Export inferred TypeScript types (`Clinic`, `NewClinic`, `Patient`, `NewPatient`, `Allergy`, `Problem`, `Appointment`, `Consultation`, `Prescription`, `PrescriptionItem`, etc.).

### Step 6: Generate & Run Drizzle Migration
1. Run `pnpm db:generate` to generate SQL migration files in `drizzle/`.
2. Review generated migration SQL to ensure foreign keys, tables, and columns match specs.
3. Run `pnpm db:migrate` to apply migrations to Supabase Postgres via `DIRECT_URL`.

### Step 7: Seed Development Fixtures
1. Create [`lib/db/seed.ts`](file:///home/darkside/projects/clinicare/lib/db/seed.ts):
   - 1 clinic (`id: "clinic-dev"`, name: "CliniCare Central")
   - 1 doctor row in `user` table (`id: "user-doctor-1"`, role: "doctor", clinicId: "clinic-dev")
   - 1 receptionist row in `user` table (`id: "user-receptionist-1"`, role: "receptionist", clinicId: "clinic-dev")
   - 3 realistic patient profiles with varied allergies and problems
   - 5 appointments across scheduled, checked-in, completed statuses including a walk-in
2. Execute `pnpm db:seed` and verify database population without errors.

### Step 8: Schema Unit Tests & Verification
1. Create [`lib/db/__tests__/schema.test.ts`](file:///home/darkside/projects/clinicare/lib/db/__tests__/schema.test.ts):
   - Assert all table exports exist (`clinics`, `patients`, `allergies`, `problems`, `appointments`, `consultations`, `prescriptions`, `prescriptionItems`, `user`, `session`, `account`, `verification`).
   - Use `expectTypeOf` to assert type shapes compile cleanly.
2. Run test suite:
   ```bash
   pnpm test
   ```
3. Run production build check:
   ```bash
   pnpm build
   ```
4. Update [`docs/ROADMAP.md`](file:///home/darkside/projects/clinicare/docs/ROADMAP.md) checking off Phase 1 tasks.

---

## 3. Verification & Acceptance Criteria

| Check | Command | Success Criteria |
|---|---|---|
| Migration Generation | `pnpm db:generate` | Generates consistent migration file without schema errors. |
| Database Migration | `pnpm db:migrate` | Applies cleanly to development Supabase instance. |
| Seed Execution | `pnpm db:seed` | Populates sample clinic, users, patients, and appointments with zero errors. |
| Unit Tests | `pnpm test` | All schema tests pass. |
| Build Check | `pnpm build` | Zero TypeScript/build errors. |
