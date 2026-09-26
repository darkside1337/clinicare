# CliniCare — Implementation Roadmap

> **How to use this document**
> Phases are sequential. Complete every step (including tests) before starting the next phase.
> Mark steps complete by changing `- [ ]` → `- [x]` once work is verified.
> Never check a box unless the build passes and tests are green.
>
> **Testing scope note:** This roadmap uses _lightweight_ Vitest unit tests only — pure logic:
> Zod schema validation and mutation/query `clinicId`-scoping checks (mocked DB), per feature.
> No component tests, no React Testing Library, no jsdom, no Server Action integration test suite.
> End-to-end/UI testing (Playwright) is deferred to post-MVP polish, per `docs/ARCHITECTURE.md`.
> Two manual (non-automated) audits — multi-tenancy and role-gating — are still required in Phase 9.

---

## Phase 0 — Project Foundation

Establishes the monorepo baseline, dependency set, environment contract, and testing infrastructure before any application code is written.

### 0.1 Dependencies & Tooling

- [x] Add missing runtime dependencies:
  ```
  pnpm add drizzle-orm @supabase/supabase-js better-auth react-hook-form zod drizzle-zod @react-pdf/renderer next-themes
  ```
- [x] Add dev dependencies (lightweight logic-only test setup — no React/DOM testing deps):
  ```
  pnpm add -D drizzle-kit vitest vite-tsconfig-paths tsx
  ```
- [x] Verify `package.json` `packageManager` matches your actual installed pnpm version (run `pnpm --version` and confirm — do not assume a version number).

### 0.2 Environment Variables

- [x] Create `.env.example` with all required variables (no real secrets):
  ```
  DATABASE_URL=
  DIRECT_URL=
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=
  GITHUB_CLIENT_ID=
  GITHUB_CLIENT_SECRET=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  ```
- [x] Create `.env.local` (git-ignored) with real development values.
- [x] Confirm `.env*.local` is in `.gitignore`.

### 0.3 Vitest Configuration

- [x] Create `vitest.config.ts` at project root (Node environment — no jsdom/React plugin needed, since only pure logic is under test):

  ```ts
  import { defineConfig } from "vitest/config";
  import tsconfigPaths from "vite-tsconfig-paths";

  export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      globals: true,
      include: ["**/*.test.ts"],
      exclude: ["node_modules", ".next"],
    },
  });
  ```

- [x] Add test scripts to `package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```
- [x] **Test:** Run `pnpm test` — zero tests collected, exit 0. ✅

### 0.4 TypeScript & Path Aliases

- [x] Confirm `tsconfig.json` has `"baseUrl": "."` and path alias `"@/*": ["./*"]`.
- [x] Confirm `next.config.ts` (or `.js`) exists with no errors (`pnpm build` exits 0).

### 0.5 Folder Scaffold

- [x] Create the following empty directories (with `.gitkeep` where needed):
  ```
  features/patients/components/
  features/appointments/components/
  features/consultations/components/
  features/prescriptions/components/
  features/prescriptions/pdf/
  lib/auth/
  lib/db/
  lib/supabase/
  components/layout/
  ```

---

## Phase 1 — Database Schema & ORM

Configures Better Auth, generates its schema, defines domain tables, runs a single unified migration, and seeds development data.

### 1.1 Drizzle Client

- [x] Create `lib/db/client.ts` — exports a singleton Drizzle instance connected via `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, for migrations).
- [x] Configure `drizzle.config.ts` at project root pointing to `lib/db/schema.ts` and the `DIRECT_URL`.

### 1.2 Better Auth Config (First Pass — No Migration Yet)

- [x] Create `lib/auth/auth.ts` — initialises Better Auth:
  - Configure `drizzleAdapter` pointing to `lib/db/client.ts`.
  - Configure GitHub and Google OAuth providers (credentials from env).
  - Use `user.additionalFields` to declare `clinicId` (string, references `clinics.id`) and `role` (string enum: `doctor | receptionist`) as extra columns on Better Auth's own user table.
  - Do **not** create a separate hand-written `users` table.

### 1.3 Generate Better Auth Schema via CLI

- [x] Run Better Auth CLI schema generation:
  ```bash
  npx @better-auth/cli@latest generate --adapter drizzle --dialect pg --output lib/db/auth-schema.ts
  ```
  - Outputs authoritative `user`, `session`, `account`, and `verification` table definitions into `lib/db/auth-schema.ts` including the `clinicId` and `role` columns.

### 1.4 Unified Schema & Migration

- [x] Create `lib/db/schema.ts` defining domain tables matching `docs/PRD.md §9`:
  - `clinics` — `id`, `name`, `logoUrl`, `createdAt`
  - `patients` — `id`, `clinicId` (FK → clinics), `name`, `dob`, `sex`, `phone`, `email`, `address`, `deletedAt`, `createdAt`, `updatedAt`
  - `allergies` — `id`, `patientId` (FK → patients), `substance`, `severity` (enum: `mild | moderate | severe`), `reaction`, `createdAt`
  - `problems` — `id`, `patientId` (FK → patients), `condition`, `status` (enum: `active | resolved`), `onsetDate`, `createdAt`
  - `appointments` — `id`, `clinicId`, `patientId`, `doctorId` (FK → `user.id`), `scheduledAt`, `status` (enum: `scheduled | checked-in | completed | no-show | cancelled`), `isWalkIn`, `reason`, `createdAt`
  - `consultations` — `id`, `patientId`, `doctorId` (FK → `user.id`), `appointmentId` (unique FK), `chiefComplaint`, `symptoms`, `observations`, `diagnosis`, `treatment`, `notes`, `createdAt`, `updatedAt`
  - `prescriptions` — `id`, `consultationId` (FK), `createdAt`
  - `prescriptionItems` — `id`, `prescriptionId`, `medication`, `dosage`, `frequency`, `duration`, `instructions`
- [x] Import and re-export all generated auth tables (`user`, `session`, `account`, `verification`) from `lib/db/auth-schema.ts` alongside domain tables.
- [x] Ensure all user foreign keys (`appointments.doctorId`, `consultations.doctorId`) point directly at the generated `user.id`.
- [x] Export all table references and inferred TypeScript types from `lib/db/schema.ts`.
- [x] Run `pnpm db:generate` — migration file covering both auth and domain tables created in a single consistent pass.
- [x] Run `pnpm db:migrate` against the development Supabase database.

### 1.5 Seed Data

- [x] Create `lib/db/seed.ts` — inserts:
  - 1 clinic (`id: "clinic-dev"`)
  - 1 doctor row inserted into the generated `user` table (`role: "doctor"`, `clinicId: "clinic-dev"`)
  - 1 receptionist row inserted into the generated `user` table (`role: "receptionist"`, `clinicId: "clinic-dev"`)
  - 3 patients with varying allergies and problems
  - 5 appointments (mix of statuses, one walk-in)
- [x] Add `"db:seed": "tsx lib/db/seed.ts"` to `package.json`.
- [x] Run `pnpm db:seed` — no errors.

### 1.6 Schema Tests

- [x] `lib/db/__tests__/schema.test.ts` — unit tests verifying:
  - All required table exports exist (both auth tables `user`, `session`, `account`, `verification` and domain tables).
  - TypeScript types resolve correctly for `User`, `Session`, `NewPatient`, `Appointment`, etc. (compile-only checks via `expectTypeOf`).
- [x] **Test:** `pnpm test` — all schema tests pass. ✅

---

## Phase 2 — Authentication

Sets up auth route handlers, client helpers, session resolution, and role-gating.

### 2.1 Route Handler & Client Wiring

- [x] Create `app/api/auth/[...all]/route.ts` — mounts the Better Auth request handler (`toNextJsHandler(auth)`).
- [x] Create `lib/auth/client.ts` — Better Auth browser client (`createAuthClient()`), used in client components for sign-in/sign-out.

### 2.3 Proxy (Soft, Unauthoritative Redirect Layer)

- [x] Create `proxy.ts` at project root — a **soft, cookie-presence-only** check that bounces unauthenticated requests toward `/login` before they hit a page. It does **not** check role or `clinicId`, and it is not a substitute for `getSession()`/`requireDoctor()`, which remain the only real enforcement point in every page and Server Action:

  ```ts
  import { NextRequest, NextResponse } from "next/server";
  import { getSessionCookie } from "better-auth/cookies";

  export function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      if (request.nextUrl.pathname !== "/dashboard") {
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: [
      "/dashboard",
      "/dashboard/:path*",
      "/patients",
      "/patients/:path*",
      "/appointments",
      "/appointments/:path*",
    ],
  };
  ```

- [x] Confirm the matcher covers every route under `app/(app)/` — expand it as new top-level route segments are added in later phases.

### 2.4 Auth Tests

- [x] `lib/auth/__tests__/session.test.ts`:
  - Mock Better Auth session; assert `getSession()` redirects when session is absent.
  - Assert `getSession()` throws/returns "not set up" when user has no clinic.
  - Assert `getSession()` returns `{ user, clinicId, role }` for a valid, clinic-linked session.
- [x] `lib/auth/__tests__/require-doctor.test.ts`:
  - Assert `requireDoctor()` passes for `role: doctor`.
  - Assert `requireDoctor()` throws `ForbiddenError` for `role: receptionist`.
- [x] **Test:** `pnpm test` — all auth tests pass. ✅

---

## Phase 3 — Feature Modules: Patients

Implements the full patients domain — queries, mutations, schema validation, and core UI components.

### 3.1 Zod Schemas

- [x] Create `features/patients/schema.ts`:
  - `patientSchema` — create/edit form fields (name, dob, sex, phone, email, address); derived from Drizzle schema via `drizzle-zod`, extended for form shape.
  - `allergySchema` — substance, severity, reaction.
  - `problemSchema` — condition, status, onsetDate.

### 3.2 Queries

- [x] Create `features/patients/queries.ts`:
  - `listPatients(clinicId, search?)` — returns paginated/filtered list.
  - `getPatient(clinicId, patientId)` — returns single patient or `null`.
  - `getPatientSummary(clinicId, patientId)` — returns patient + active allergies + active problems + recent prescriptions + upcoming appointments (used for profile page above-the-fold).
  - `listAllergies(clinicId, patientId)`.
  - `listProblems(clinicId, patientId)`.
  - All functions filter by `clinicId`; missing `clinicId` is a type error.

### 3.3 Mutations

- [x] Create `features/patients/mutations.ts`:
  - `createPatient(clinicId, input: NewPatientInput)`.
  - `updatePatient(clinicId, patientId, input)`.
  - `softDeletePatient(clinicId, patientId)` — sets `deletedAt = now()`.
  - `createAllergy(clinicId, input)`.
  - `updateAllergy(clinicId, allergyId, input)`.
  - `deleteAllergy(clinicId, allergyId)`.
  - `createProblem(clinicId, input)`.
  - `updateProblem(clinicId, problemId, input)`.

### 3.4 Feature Tests

- [x] `features/patients/__tests__/schema.test.ts`:
  - Assert `patientSchema.safeParse` accepts valid input.
  - Assert `patientSchema.safeParse` rejects missing required fields.
  - Assert `allergySchema` validates `severity` enum.
- [x] `features/patients/__tests__/queries.test.ts` (mock the DB client):
  - Assert `listPatients` always passes `clinicId` in the WHERE clause.
  - Assert `getPatientSummary` returns `null` for a non-existent patient.
  - Assert `listPatients` excludes soft-deleted patients.
- [x] `features/patients/__tests__/mutations.test.ts` (mock the DB client):
  - Assert `softDeletePatient` sets `deletedAt` and does not hard-delete.
  - Assert `createPatient` inserts `clinicId` from the parameter, not from any global.
- [x] **Test:** `pnpm test` — all patient tests pass. ✅

### 3.5 Patient UI Components

- [x] `features/patients/components/patient-form.tsx` — (JSX scaffolded) Wire intake and edit form to React Hook Form + `patientSchema` resolver and `createPatient`/`updatePatient` Server Actions.
- [x] `features/patients/components/patient-table.tsx` — (JSX scaffolded) Wire master directory table and status filter tabs to server query results / URL search params.
- [x] `features/patients/components/patient-search.tsx` — (JSX scaffolded) Wire debounced search input to `listPatients` Server Action / query.
- [x] `features/patients/components/allergy-list.tsx` — (JSX scaffolded) Wire allergy display and inline add/delete modal to `allergySchema` and allergy mutations.
- [x] `features/patients/components/problem-list.tsx` — (JSX scaffolded) Wire problem list display and inline add/edit modal to `problemSchema` and problem mutations.

(No component tests for this phase — see testing scope note at the top of this document.)

---

## Phase 4 — Feature Modules: Appointments

### 4.1 Zod Schemas

- [x] Create `features/appointments/schema.ts`:
  - `appointmentSchema` — patientId, doctorId, scheduledAt, status, isWalkIn, reason.

### 4.2 Queries

- [x] Create `features/appointments/queries.ts`:
  - `listAppointmentsForDay(clinicId, date, doctorId?)`.
  - `listAppointmentsForPatient(clinicId, patientId)`.
  - `getAppointment(clinicId, appointmentId)`.

### 4.3 Mutations

- [x] Create `features/appointments/mutations.ts`:
  - `createAppointment(clinicId, input)`.
  - `updateAppointment(clinicId, appointmentId, input)`.
  - `createWalkInAppointment(clinicId, patientId, doctorId)` — creates with `isWalkIn: true`, `status: checked-in`, `scheduledAt: now()`.

### 4.4 Feature Tests

- [x] `features/appointments/__tests__/schema.test.ts`:
  - `appointmentSchema` rejects invalid status values.
  - `appointmentSchema` accepts all valid statuses.
- [x] `features/appointments/__tests__/queries.test.ts` (mock DB):
  - `listAppointmentsForDay` filters by date range and `clinicId`.
  - `listAppointmentsForDay` optionally filters by `doctorId`.
- [x] `features/appointments/__tests__/mutations.test.ts` (mock DB):
  - `createWalkInAppointment` sets `isWalkIn: true` and `status: "checked-in"`.
- [x] **Test:** `pnpm test` — all appointment tests pass. ✅

### 4.5 Appointment UI Components

- [x] `features/appointments/components/appointment-form.tsx` — (JSX scaffolded) Wire booking modal to React Hook Form + `appointmentSchema` resolver and `createAppointment` Server Action.
- [x] `features/appointments/components/appointment-status-badge.tsx` — (JSX scaffolded) Maps appointment status → label + color class variants.
- [x] `features/appointments/components/day-view.tsx` — (JSX scaffolded) Wire multi-practitioner calendar grid to `listAppointmentsForDay` query and slot click handler.
- [x] `features/appointments/components/appointment-queue.tsx` — (JSX scaffolded) Wire today's appointment queue and status changer to appointment queries & mutations.
- [x] `features/appointments/components/dashboard-quick-actions.tsx` — (JSX scaffolded) Wire walk-in action to `createWalkInAppointment` mutation.

---

## Phase 5 — Feature Modules: Consultations

### 5.1 Zod Schemas

- [x] Create `features/consultations/schema.ts`:
  - `consultationSchema` — chiefComplaint (required), symptoms, observations, diagnosis, treatment, notes (all optional strings).

### 5.2 Queries

- [x] Create `features/consultations/queries.ts`:
  - `listConsultationsForPatient(clinicId, patientId)` — reverse-chronological.
  - `getConsultation(clinicId, consultationId)` — includes any linked prescriptions.

### 5.3 Mutations

- [x] Create `features/consultations/mutations.ts`:
  - `createConsultation(clinicId, input)` — also updates linked appointment status to `completed`.
  - `updateConsultation(clinicId, consultationId, input)`.

### 5.4 Feature Tests

- [x] `features/consultations/__tests__/schema.test.ts`:
  - `consultationSchema` requires `chiefComplaint`.
  - `consultationSchema` accepts all-optional remaining fields.
- [x] `features/consultations/__tests__/mutations.test.ts` (mock DB):
  - `createConsultation` sets appointment status to `"completed"` in the same transaction.
  - `createConsultation` always passes `clinicId` to patient/appointment scope checks.
- [x] **Test:** `pnpm test` — all consultation tests pass. ✅

### 5.5 Consultation UI Components

- [x] `features/consultations/components/consultation-form.tsx` — (JSX scaffolded) Wire full-page 6 free-text fields (`chiefComplaint`, `symptoms`, `observations`, `diagnosis`, `treatment`, `notes`) to React Hook Form + `consultationSchema` resolver and `createConsultation` Server Action.
- [x] `features/consultations/components/consultation-card.tsx` — (JSX scaffolded) Read-only summary card for the patient timeline (chief complaint, diagnosis, date, doctor name; expandable to show full clinical narrative and prescription status).
- [x] `features/consultations/components/consultation-timeline.tsx` — (JSX scaffolded) Reverse-chronological timeline of `consultation-card`s; wire to `listConsultationsForPatient` query.

(No component tests for this phase — see testing scope note at the top of this document.)

---

## Phase 6 — Feature Modules: Prescriptions & PDF

### 6.1 Zod Schemas

- [x] Create `features/prescriptions/schema.ts`:
  - `prescriptionItemSchema` — medication, dosage, frequency, duration, instructions.
  - `createPrescriptionSchema` — `{ consultationId, items: prescriptionItemSchema[] }` (min 1 item).

### 6.2 Queries & Mutations

- [x] Create `features/prescriptions/queries.ts`:
  - `getPrescription(clinicId, prescriptionId)` — includes items, consultation, patient, doctor.
  - `listPrescriptionsForPatient(clinicId, patientId)`.
  - `listPrescriptionsForConsultation(clinicId, consultationId)` — supports the multi-prescription-per-consultation display.
- [x] Create `features/prescriptions/mutations.ts`:
  - `createPrescription(clinicId, input)` — inserts prescription + all items in a transaction. Each call creates one independent prescription row; a consultation may have this called multiple times.

### 6.3 PDF Template

- [x] Create `features/prescriptions/pdf/prescription-document.tsx` — `@react-pdf/renderer` component:
  - Renders clinic name, logo (if available), doctor name, patient name + DOB, date.
  - Items table: medication, dosage, frequency, duration, instructions.
  - Signature line.
  - UK date format (`DD/MM/YYYY`) — confirm against `docs/DESIGN.md`.
  - A5 or A4 page size, print-safe margins.
  - Renders exactly **one** prescription per PDF (not all of a consultation's prescriptions combined) — each is downloaded/printed independently.

### 6.4 PDF Route Handler

- [x] Create `app/(app)/prescriptions/[id]/pdf/route.ts` — Server Route Handler:
  - Resolves session + `clinicId`.
  - Calls `getPrescription(clinicId, id)`.
  - Renders PDF via `renderToStream` from `@react-pdf/renderer`.
  - Returns `Content-Type: application/pdf` response.

### 6.5 Feature Tests

- [x] `features/prescriptions/__tests__/schema.test.ts`:
  - `createPrescriptionSchema` rejects empty `items` array.
  - `prescriptionItemSchema` requires `medication` and `dosage`.
- [x] `features/prescriptions/__tests__/mutations.test.ts` (mock DB):
  - `createPrescription` inserts all items linked to the new prescription ID.
  - All DB calls receive `clinicId` for scope verification.
  - Calling `createPrescription` twice for the same `consultationId` produces two independent prescription rows, not an overwrite.
- [x] **Test:** `pnpm test` — all prescription tests pass. ✅

### 6.6 Prescription UI Components

- [x] `features/prescriptions/components/prescription-form.tsx` — (JSX scaffolded) Wire dynamic item list (add/remove rows) to React Hook Form + `prescriptionItemSchema` resolver and `createPrescription` mutation.
- [x] `features/prescriptions/components/prescription-list.tsx` — (JSX scaffolded) Wire multi-prescription switcher/list per consultation to `listPrescriptionsForConsultation` query.
- [x] `features/prescriptions/components/prescription-summary.tsx` — (JSX scaffolded) Read-only itemized prescription card with print sheet trigger and PDF download link via route handler.
- [x] `features/prescriptions/pdf/prescription-document.tsx` — (JSX scaffolded) Vector PDF template rendered via `@react-pdf/renderer` for single-prescription export.

---

## Phase 7 — App Shell & Navigation

### 7.1 Design Tokens

- [x] Apply `DESIGN.md` color tokens to `tailwind.config.ts` (or via CSS variables in `app/globals.css`).
- [x] Load fonts specified in `docs/DESIGN.md` via `next/font/google` in `app/layout.tsx`.
- [x] Configure Tailwind to use the custom CSS variables per `docs/DESIGN.md`.

### 7.2 App Layout

- [x] Create `app/(auth)/layout.tsx` — minimal centered layout (login page only).
- [x] Create `app/(app)/layout.tsx` — calls `getSession()` at the top (the authoritative check — `proxy.ts` only handles the soft pre-redirect); renders the app shell:
  - Persistent top navigation bar (clinic name, user name, sign-out).
  - Sidebar or top tabs: Dashboard, Patients, Appointments.
  - Cmd+K trigger visible in the nav.
- [x] Create `components/layout/nav.tsx` — top navigation bar using Shadcn primitives.
- [x] Create `components/layout/sidebar.tsx` — role-aware nav links (receptionist sees no consultation shortcuts).

### 7.3 Command Palette (Cmd+K)

- [x] Install `pnpm dlx shadcn@latest add command`.
- [x] Create `components/layout/command-palette.tsx`:
  - Keyboard shortcut `⌘K` / `Ctrl+K` opens it.
  - Searches patients within `clinicId` (debounced Server Action call).
  - Doctor: shows "View profile" and "Start consultation" actions.
  - Receptionist: shows "View profile" only.
  - "Start consultation" triggers `createWalkInAppointment` and navigates to `/patients/[id]/consultations/new`.

(No component tests for this phase — see testing scope note at the top of this document.)

---

## Phase 8 — Routes & Pages

Builds every route as a thin orchestration layer over the feature modules.

### 8.1 Login Page

- [ ] Create `app/(auth)/login/page.tsx`:
  - Two Shadcn `Button` components: "Continue with GitHub", "Continue with Google".
  - Calls Better Auth client `signIn.social({ provider: "github" | "google" })`.
  - No email/password fields.
- [ ] Create `app/(auth)/login/not-set-up/page.tsx` — static "Contact your clinic admin" screen for unprovisioned OAuth users.

### 8.2 Dashboard (`/dashboard`)

- [ ] Create `app/(app)/dashboard/page.tsx`:
  - Calls `getSession()`.
  - Fetches today's appointments via `listAppointmentsForDay`.
  - Renders `<DayView>` and quick-action buttons.
  - Role-aware: receptionist does not see "Start walk-in" or consultation shortcuts.
- [ ] Create `features/appointments/components/dashboard-quick-actions.tsx`.

### 8.3 Patients List (`/patients`)

- [ ] Create `app/(app)/patients/page.tsx`:
  - Server Component; accepts `?search=` query param.
  - Calls `listPatients(clinicId, search)`.
  - Renders a Shadcn `Table` with patient rows; each row links to `/patients/[id]`.
- [ ] Create `app/(app)/patients/actions.ts`:
  - `createPatientAction(input)` — thin wrapper over `createPatient`.
- [ ] Create `features/patients/components/patient-table.tsx` — Shadcn `Table` with name, DOB, phone columns.

### 8.4 Patient Profile (`/patients/[id]`)

- [ ] Create `app/(app)/patients/[id]/page.tsx`:
  - Calls `getSession()` + `getPatientSummary(clinicId, id)`.
  - Two-column layout (per `DESIGN.md`): left sticky column (demographics, allergies, problems); right column (consultation timeline, upcoming appointments, active prescriptions).
  - "Start Consultation" CTA visible to doctors only (role check in the Server Component).
  - Allergies and problems are always visible above the fold; never behind a tab.
- [ ] Create `app/(app)/patients/[id]/actions.ts`:
  - `updatePatientAction`, `addAllergyAction`, `updateAllergyAction`, `deleteAllergyAction`, `addProblemAction`, `updateProblemAction`.

### 8.5 New Consultation (`/patients/[id]/consultations/new`)

- [ ] Create `app/(app)/patients/[id]/consultations/new/page.tsx`:
  - Calls `requireDoctor()` — redirects/throws if receptionist or unauthenticated.
  - Accepts optional `?appointmentId=` query param (pre-linked walk-in or scheduled).
  - Renders `<ConsultationForm>` (with its embedded multi-prescription list, per 5.5) in a dedicated full-page layout (no modal).
- [ ] Create `app/(app)/patients/[id]/consultations/new/actions.ts`:
  - `createConsultationAction(input)` — calls `createConsultation`, then navigates to the saved consultation.

### 8.6 View/Edit Consultation (`/patients/[id]/consultations/[id]`)

- [ ] Create `app/(app)/patients/[id]/consultations/[id]/page.tsx`:
  - Calls `requireDoctor()`.
  - Fetches consultation + all linked prescriptions (plural).
  - Renders `<ConsultationForm>` pre-populated; `<PrescriptionList>` with an "Add another prescription" CTA.
- [ ] Create `app/(app)/patients/[id]/consultations/[id]/actions.ts`:
  - `updateConsultationAction`, `createPrescriptionAction`.

### 8.7 Appointments (`/appointments`)

- [ ] Create `app/(app)/appointments/page.tsx`:
  - Accepts `?date=` and `?doctorId=` query params.
  - Renders `<DayView>` + filter controls.
- [ ] Create `app/(app)/appointments/actions.ts`:
  - `createAppointmentAction`, `updateAppointmentStatusAction`.

### 8.8 Error Boundaries

- [ ] Create `app/(app)/error.tsx` — generic error boundary (unexpected server errors).
- [ ] Create `app/(app)/patients/[id]/consultations/error.tsx` — handles `ForbiddenError` with a "not authorised" message.
- [ ] Create `app/not-found.tsx`.

### 8.9 Client Wrapper Cleanup

- [ ] Confirm every intermediate `*-client.tsx` file introduced during the pre-Phase-0 decomposition pass (`dashboard-client.tsx`, `appointments-client.tsx`, `patients-client.tsx`, `patient-profile-client.tsx`, `consultation-new-client.tsx`, `consultation-detail-client.tsx`) has been either absorbed into its `page.tsx` (if the interactivity was mockup-only and is now replaced by real Server Actions) or is still genuinely necessary as a Client Component boundary — and that no file remains solely because of leftover `localStorage`/mock-data logic that real queries/mutations have since replaced.

---

## Phase 9 — Integration & End-to-End Validation

### 9.1 Multi-Tenancy Audit (manual checklist, not automated)

- [ ] Run a project-wide grep for any query/mutation call that lacks a `clinicId` argument:
  ```
  grep -r "db.query\|db.select\|db.insert\|db.update\|db.delete" features/ --include="*.ts" -l
  ```
  Manually verify every file returned passes `clinicId`.
- [ ] Confirm no route under `app/(app)/` renders clinical data without calling `getSession()` or `requireDoctor()` first.
- [ ] Confirm `proxy.ts` is never relied upon anywhere as a substitute for these checks — it is redirect-only.

### 9.2 Role-Gate Audit (manual checklist, not automated)

- [ ] List all routes under `consultations/` and `prescriptions/`; confirm every `page.tsx` and `actions.ts` calls `requireDoctor()`.
- [ ] Confirm receptionist-facing pages never import or render consultation/prescription components.

### 9.3 Build Check

- [x] Run `pnpm build` — exits 0 with no TypeScript or Next.js errors.
- [ ] Run `pnpm test` — full (lightweight) test suite green. ✅

---

## Phase 10 — Polish, Accessibility & UX

### 10.1 Design System Compliance

- [ ] Run `git diff` on all modified pages; replace any raw `<button>`, `<input>`, `<select>`, or `<textarea>` outside `components/ui/` with Shadcn primitives.
- [ ] Verify allergy severity badges use the color tokens specified in `docs/DESIGN.md`.
- [ ] Verify all timestamps rendered per the date format specified in `docs/DESIGN.md`.
- [ ] Verify any numeric-display treatment (tabular numerals, etc.) specified in `docs/DESIGN.md` is applied to dates, dosages, and record IDs.

### 10.2 Empty States

- [ ] Patient profile — no allergies, no problems, no consultations, no appointments: each section renders a non-intrusive empty state message.
- [ ] Dashboard — no appointments today: renders an empty state (not a blank panel).
- [ ] Appointments page — no appointments for selected date: renders empty state.
- [ ] Consultation page — zero prescriptions attached: renders a clear "no prescriptions" state rather than an empty list with no explanation.

### 10.3 Responsive / Mobile

- [ ] Patient profile collapses to single column on `< md` breakpoint (left column above timeline).
- [ ] Command palette is usable on mobile (touch-friendly target sizes, no hover-only affordances).
- [ ] Navigation collapses to a mobile-friendly layout at `< md`.

### 10.4 Accessibility

- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Escape).
- [ ] Severity badges have accessible labels (not color alone as the signal).
- [ ] Form fields have explicit `<label>` elements (via Shadcn `FormLabel`).
- [ ] `aria-live` regions on Server Action feedback (success/error inline messages).

### 10.5 Loading States

- [ ] Add `loading.tsx` for `/patients`, `/patients/[id]`, `/appointments`, `/dashboard` showing skeleton placeholders.
- [ ] Consultation form submit button shows a loading spinner while the Server Action is in-flight.
- [ ] Each "Add prescription" action within the consultation page shows its own loading state independent of the overall form submit.

---

## Phase 11 — Supabase Storage Integration

### 11.1 Storage Helpers

- [ ] Create `lib/supabase/storage.ts`:
  - `uploadClinicLogo(clinicId, file: File): Promise<string>` — uploads to `clinics/{clinicId}/logo` bucket; returns public URL.
  - `uploadDoctorSignature(doctorId, file: File): Promise<string>` — uploads to `doctors/{doctorId}/signature`; returns signed URL.
  - `getPublicUrl(path: string): string`.

### 11.2 Clinic Settings Page (Stretch)

- [ ] Create `app/(app)/settings/page.tsx`:
  - Doctor only.
  - Upload clinic logo (Shadcn `Input type="file"`).
  - On save: calls `uploadClinicLogo`, stores URL in `clinics.logoUrl`.

### 11.3 Storage Tests

- [ ] `lib/supabase/__tests__/storage.test.ts`:
  - Mock Supabase client; assert `uploadClinicLogo` calls the correct bucket/path.
  - Assert URL returned matches expected format.
- [ ] **Test:** `pnpm test` — storage tests pass. ✅

---

## Phase 12 — Deployment

### 12.1 Vercel Setup

- [ ] Connect GitHub repo to Vercel project.
- [ ] Set all environment variables from `.env.example` in Vercel dashboard (production and preview).
- [ ] Set `NEXT_PUBLIC_APP_URL` to the Vercel production domain.

### 12.2 Database Migrations on Deploy

- [ ] Add a Vercel build command or post-deploy hook that runs `pnpm db:migrate` using `DIRECT_URL`.
- [ ] Confirm migrations run before the app starts serving traffic.

### 12.3 Production Checklist

- [ ] `pnpm build` passes in Vercel build logs.
- [ ] OAuth redirect URIs updated in GitHub and Google OAuth app settings to the production domain.
- [ ] Supabase RLS is **off** (per `docs/ARCHITECTURE.md §2`, "Multi-Tenancy Model") — confirm Storage bucket policies restrict access to service role only (no public reads except the clinic logo bucket).
- [ ] Verify the "not yet set up" flow for a new OAuth user in production (no clinic assigned).
- [ ] Confirm `proxy.ts`'s matcher is up to date with every protected route segment that exists at deploy time.

---

## Phase 13 — Final Test Pass

- [ ] Run the full (lightweight) Vitest suite: `pnpm test` — 0 failing tests. ✅
- [ ] Run `pnpm build` — 0 TypeScript errors, 0 Next.js build errors. ✅
- [ ] Run `pnpm lint` — 0 ESLint errors. ✅
- [ ] Manual smoke test of the complete doctor workflow:
  1. Log in via GitHub OAuth.
  2. Search for a patient (Cmd+K).
  3. Start a walk-in consultation → creates appointment automatically.
  4. Fill and save the consultation form.
  5. Add two separate prescriptions to the same consultation, each with its own items.
  6. Download/print each prescription's PDF independently.
- [ ] Manual smoke test of the complete receptionist workflow:
  1. Log in via Google OAuth as a receptionist.
  2. View patients list; open a patient profile.
  3. Confirm no clinical data is visible (no consultation timeline, no prescriptions).
  4. Create a new scheduled appointment.
  5. Attempt to navigate to `/patients/[id]/consultations/new` directly — confirm `requireDoctor()` blocks access (not just `proxy.ts`'s redirect).

---

## Milestone Summary

| Phase | Focus               | Key Deliverable                                                          |
| ----- | ------------------- | ------------------------------------------------------------------------ |
| 0     | Foundation          | Lightweight Vitest configured, folders scaffolded                        |
| 1     | Database            | Unified auth & domain schema migrated, seed data live                    |
| 2     | Auth                | Route handler, client, session helpers, role guards, `proxy.ts` soft redirect |
| 3     | Patients            | Queries, mutations, form + list UI                                       |
| 4     | Appointments        | Queries, mutations, day-view UI                                          |
| 5     | Consultations       | Queries, mutations, full-page form with embedded multi-prescription list |
| 6     | Prescriptions + PDF | CRUD (multiple per consultation) + @react-pdf/renderer template          |
| 7     | App Shell           | Nav, sidebar, Cmd+K command palette                                      |
| 8     | Routes              | All pages wired to feature modules                                       |
| 9     | Integration         | Manual multi-tenancy + role-gate audits                                  |
| 10    | Polish              | Design compliance, a11y, empty states                                    |
| 11    | Storage             | Supabase logo/signature upload helpers                                   |
| 12    | Deployment          | Vercel + migration pipeline                                              |
| 13    | Final QA            | Full lightweight test pass + manual smoke tests                          |
