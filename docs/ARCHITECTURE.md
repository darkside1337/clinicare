# CliniCare — Architecture

This document describes _how_ CliniCare is structured and the conventions to follow when implementing it. See `PRD.md` for _what_ is being built (features, data model, routes).

## 1. Tech Stack (reference)

Next.js 16 (App Router), React 19, TypeScript, Tailwind + shadcn/ui, React Hook Form + drizzle-zod, Drizzle ORM, Supabase (Postgres + Storage), Better Auth (OAuth: GitHub, Google), Zod, @react-pdf/renderer, pnpm, Vercel.

## 2. Multi-Tenancy Model

CliniCare is multi-tenant by `clinic_id`. Tenancy is enforced **entirely in application code**, not via Postgres Row Level Security. Every query and mutation that touches clinic-scoped data (patients, appointments, consultations, prescriptions, allergies, problems) must filter by the current session's `clinic_id`.

This means: **there is no such thing as a query in this codebase that fetches clinical data without a `clinicId` in scope.** Any query module function that omits it is a bug.

## 3. Session Resolution

A single shared helper resolves the current user, their clinic, and their role. It is the only source of truth for "who is making this request."

```ts
// lib/auth/session.ts
export async function getSession(): Promise<{
  user: { id: string; name: string; email: string };
  clinicId: string;
  role: "doctor" | "receptionist";
}> {
  // reads the Better Auth session, throws/redirects to /login if absent,
  // throws if the account has no clinic/role assignment yet (see PRD 8.1)
}

// For public routes (e.g. landing page /), a non-redirecting counterpart resolves session if present:
export async function getOptionalSession(): Promise<SessionContext | null> {
  // returns SessionContext if valid session and clinic assigned, else null
}
```

- Called at the top of **every** Server Component that renders protected data and **every** Server Action.
- For role-gated routes (e.g. anything under `consultations/`), a second helper wraps it:

```ts
// lib/auth/require-doctor.ts
export async function requireDoctor() {
  const session = await getSession();
  if (session.role !== "doctor") throw new ForbiddenError();
  return session;
}
```

- This check happens server-side in the action/page itself — never relies solely on hiding UI elements client-side.

## 4. Folder Structure

Feature-based. Each domain owns its own components, queries, mutations, and validation schemas. Routing structure (`app/`) stays thin and composes from feature folders.

```
app/
  page.tsx                        -- Landing page & interactive sandbox persona switcher
  actions/
    sandbox-auth.ts               -- Non-production persona quick-login actions
  api/
    auth/
      [...all]/
        route.ts                  -- Better Auth API route handler
  (auth)/
    login/
      page.tsx
      not-set-up/
        page.tsx                  -- Holding page for unassigned accounts
  (app)/
    layout.tsx                    -- App shell with sidebar, navigation, command palette
    actions.ts                    -- Global actions (patient search, walk-in consultation)
    dashboard/
      page.tsx
    patients/
      page.tsx
      actions.ts                  -- server actions for this route
      new/
        page.tsx                  -- new patient registration
      [id]/
        page.tsx
        actions.ts
        consultations/
          new/
            page.tsx
            actions.ts
          [consultationId]/
            page.tsx
            actions.ts            -- update notes, create itemized prescription
    appointments/
      page.tsx
      actions.ts
    prescriptions/
      [id]/
        pdf/
          route.ts                -- prescription PDF binary download handler
    settings/
      page.tsx                    -- practice identity, branding & assets
      actions.ts                  -- upload clinic logo action
  features/
    patients/
      queries.ts                  -- getPatient, listPatients, getPatientSummary
      mutations.ts                -- createPatient, updatePatient, softDeletePatient
      schema.ts                   -- Zod/drizzle-zod schemas
      components/
        patient-form.tsx
        patient-search.tsx
        allergy-list.tsx
        problem-list.tsx
    appointments/
      queries.ts
      mutations.ts
      schema.ts
      components/
    consultations/
      queries.ts
      mutations.ts
      schema.ts
      components/
    prescriptions/
      queries.ts
      mutations.ts
      schema.ts
      components/
      pdf/
        prescription-document.tsx  -- @react-pdf/renderer template
    clinics/
      queries.ts                  -- getClinicById
      mutations.ts                -- updateClinicLogo
      schema.ts                   -- clinicLogoSchema
      components/
  lib/
    auth/
      auth.ts                     -- Better Auth server config (drizzleAdapter + additionalFields)
      client.ts                   -- Better Auth browser client
      session.ts                  -- getSession, getOptionalSession helpers
      require-doctor.ts           -- requireDoctor helper
    db/
      auth-schema.ts              -- Better Auth generated schema (user, session, account, verification)
      schema.ts                   -- Unified Drizzle schema (domain tables + re-exported auth schema)
      client.ts                   -- Drizzle client instance
    supabase/
      storage.ts                   -- upload/read helpers for clinic logo, signature
  components/
    ui/                             -- shadcn primitives (generated)
    layout/                         -- app shell, nav, command palette (Cmd+K)
```

**Rule of thumb:** if a query or mutation is reused by more than one route, or is non-trivial, it belongs in `features/<domain>/queries.ts` or `mutations.ts`. Server Actions in `app/.../actions.ts` are thin wrappers: resolve session → validate input → call the feature's mutation function → return a typed result.

## 5. Server Actions Pattern

Colocated with their route. A Server Action file is a thin orchestration layer, not where business logic lives.

```ts
// app/(app)/patients/[id]/actions.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { createAllergy } from "@/features/patients/mutations";
import { allergySchema, type AllergyInput } from "@/features/patients/schema";

export async function addAllergyAction(
  input: AllergyInput,
): Promise<ActionResult<Allergy>> {
  const session = await getSession();
  const parsed = allergySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors.join(", "),
    };
  }
  try {
    const allergy = await createAllergy(session.clinicId, parsed.data);
    return { success: true, data: allergy };
  } catch (e) {
    return {
      success: false,
      error: "Could not save allergy. Please try again.",
    };
  }
}
```

## 6. Error Handling Pattern

Server Actions **do not throw** for expected/user-facing failures (validation errors, permission denials that are part of normal flow, not-found records). They return a typed result:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Forms (React Hook Form + shadcn) call the action, check `success`, and render `error` inline — no error boundary involved for these cases.

Exceptions are reserved for genuinely unexpected failures (DB connection loss, programmer errors) and are caught by Next.js `error.tsx` boundaries per route segment. `ForbiddenError` (role check failures) and session-missing cases are the one deliberate exception to "no throwing" — they represent someone bypassing the UI (e.g. hitting a doctor-only URL directly as a receptionist), not a normal user flow, so they throw and are caught by an `error.tsx` that shows a generic "not authorized" page.

## 7. Database Access Pattern

One `queries.ts` and one `mutations.ts` per feature folder. These are the **only** place Drizzle queries are written. Server Components call `queries.ts` functions directly (no Server Action needed for reads); Server Actions call `mutations.ts` functions for writes.

Every exported function in these files takes `clinicId` as an explicit parameter — never pulls it from a global/implicit context — so a missing scope is a visible type error, not a silent bug.

```ts
// features/patients/queries.ts
export async function listPatients(clinicId: string, search?: string) {
  return db.query.patients.findMany({
    where: and(eq(patients.clinicId, clinicId), isNull(patients.deletedAt), ...),
  });
}
```

```ts
// features/patients/mutations.ts
export async function createPatient(clinicId: string, input: NewPatientInput) {
  return db
    .insert(patients)
    .values({ ...input, clinicId })
    .returning();
}
```

## 8. Validation

Zod schemas live in each feature's `schema.ts`, derived from Drizzle table definitions via `drizzle-zod` where possible, extended by hand for anything not 1:1 with the DB shape (e.g. multi-item prescription forms). Shared between client-side React Hook Form resolvers and server-side re-validation inside Server Actions — never trust client validation alone.

## 9. File Storage

Supabase Storage, accessed only through `lib/supabase/storage.ts` helpers (upload clinic logo, upload doctor signature, get signed/public URL). Feature code never calls the Supabase client directly.

## 10. PDF Generation

Prescription PDFs are built with `@react-pdf/renderer` components living in `features/prescriptions/pdf/`. Rendered on the server (Server Action or Route Handler), returned as a downloadable/printable response. One PDF per prescription (not per consultation), per PRD 8.7.

## 11. Naming Conventions

- Files: kebab-case (`patient-form.tsx`, `require-doctor.ts`)
- Server Action functions: `verbNounAction` (`createPatientAction`, `addAllergyAction`)
- Query/mutation functions: plain verbNoun, no suffix (`listPatients`, `createPatient`)
- DB tables/columns: snake_case in Postgres, camelCase in Drizzle schema/TS (Drizzle's default mapping)

## 12. What This Architecture Deliberately Avoids

- No client-side data-fetching/caching library (TanStack Query, SWR) — Server Components + Server Actions + `revalidatePath`/`router.refresh()` cover MVP needs.
- No API route layer for internal data access — Server Actions are the only mutation path; Server Components query directly. Route Handlers are reserved exclusively for auth protocol endpoints (`/api/auth/[...all]`) and streaming binary documents (`/prescriptions/[id]/pdf`).
- No Row Level Security — a second enforcement layer is deferred until there's a concrete reason to add one (e.g. exposing a public API later).
- No global state management library — session/clinic context is resolved per-request via `getSession()`, not held in client state.
