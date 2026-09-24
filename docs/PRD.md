# CliniCare — Product Requirements Document

## 1. Overview

CliniCare is a practice-management web application for individual doctors and small multi-doctor clinics. It is a portfolio-scale prototype, explicitly **not** a full hospital/EMR system. The central design principle is:

> How can a doctor record or review a consultation as quickly and effortlessly as possible?

The patient record — not a generic SaaS dashboard — is the primary UX surface. A doctor should be able to search for a patient and immediately see their history, active problems, allergies, and upcoming appointments.

## 2. Problem Statement

Small clinics and solo practitioners are underserved by software: they either use paper records, spreadsheets, or oversized enterprise EMR systems built for hospitals. CliniCare targets the gap — a fast, focused tool covering the core clinical workflow (patients, appointments, consultations, prescriptions) without the overhead of billing, insurance, lab integrations, or multi-hospital administration.

## 3. Goals

- Doctors can view today's schedule, find a patient, and start recording a consultation in as few steps as possible.
- A patient's full clinical picture (problems, allergies, active medications, consultation history, upcoming appointments) is visible from a single profile view.
- Support both scheduled visits and walk-ins without friction.
- Support small clinics with multiple doctors and a non-clinical receptionist role.
- Produce a clean, printable prescription PDF.

## 4. Non-Goals (explicitly out of scope for MVP)

- AI-assisted diagnosis or treatment recommendations
- Insurance integrations or claims
- Pharmacy or lab system integrations
- Hospital / multi-facility administration
- Telemedicine (video visits)
- Billing and payments
- Wearable device integrations
- Complex medical coding (ICD-10, CPT, etc.) — diagnosis/treatment are free-text
- Append-only consultations with amendment audit trail (deferred post-MVP)
- Per-doctor patient assignment locking (any doctor in a clinic can access any patient in that clinic)
- Consultation templates / copy-forward of prior consultations
- Multi-clinic switching for a single user account

## 5. Personas

**Dr. Doctor (primary user — role: `doctor`)**
A solo practitioner or one of several doctors in a small clinic. Needs to move fast between patients during a clinic day, record consultations with minimal friction, and produce prescriptions. Full access to all clinical and administrative data within their clinic.

**Riley Receptionist (secondary user — role: `receptionist`)**
Front-desk staff at a small clinic. Manages patient records and the appointment calendar. Does not have access to consultations, prescriptions, or any clinical documentation.

## 6. Roles & Permissions

| Capability                                        | Doctor           | Receptionist                                                          |
| ------------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| View/create/edit patients                         | ✅               | ✅                                                                    |
| View/create/edit appointments                     | ✅               | ✅                                                                    |
| View patient medical history, problems, allergies | ✅               | ❌                                                                    |
| Create/view consultations                         | ✅               | ❌                                                                    |
| Create/view/print prescriptions                   | ✅               | ❌                                                                    |
| View dashboard                                    | ✅ (doctor view) | ✅ (front-desk view: appointments/patients only, no clinical widgets) |

Scoping: every user belongs to exactly one clinic (`clinic_id`). Any doctor within a clinic can view and treat any patient within that same clinic — there is no per-doctor patient assignment restriction. Data from other clinics is never visible.

## 7. Core Workflow

```
Dashboard
 ├── Today's appointments
 ├── Recent patients
 └── Quick actions (new patient, start walk-in consultation, search patient)

Patient
 ├── Profile
 ├── Allergies
 ├── Problem list (chronic conditions)
 ├── Medical history / consultation timeline
 ├── Prescriptions
 └── Appointments

Consultation
 ├── Chief complaint
 ├── Symptoms
 ├── Observations
 ├── Diagnosis
 ├── Treatment
 └── Notes

Prescription
 ├── Medication
 ├── Dosage
 ├── Frequency
 ├── Duration
 └── Instructions
```

## 8. Feature Specifications

### 8.1 Authentication & Roles

- OAuth-only login for MVP via Better Auth: GitHub and Google providers (no email/password).
- Each user has a `role` (`doctor` | `receptionist`) and belongs to one `clinic`.
- New OAuth sign-ins are not auto-provisioned into a clinic; an account must be pre-invited/assigned a `clinic_id` and `role` (e.g. by an admin or seed data) before it can access clinical data. First-time OAuth users with no matching invited record see a "not yet set up — contact your clinic admin" state rather than being dropped into the app unscoped.
- **Acceptance criteria:**
  - Unauthenticated users are redirected to `/login` from any protected route.
  - `/login` offers "Continue with GitHub" and "Continue with Google" only.
  - A successful OAuth login with no associated clinic/role record does not grant access to any patient, appointment, or clinical data.
  - Receptionist accounts cannot access `/patients/[id]/consultations/*` routes or prescription data, even via direct URL (server-side enforced, not just UI-hidden).
  - All data queries are scoped to the logged-in user's `clinic_id`; no cross-clinic data leakage.

### 8.2 Dashboard (`/dashboard`)

- Shows today's appointments (all doctors in the clinic, or filterable by doctor).
- Shows recently seen/updated patients.
- Quick actions: new patient, start walk-in consultation (opens Cmd+K search pre-focused), search patient.
- Receptionist view omits clinical widgets (no consultation shortcuts).
- **Acceptance criteria:**
  - Today's appointments list updates to reflect status changes (scheduled/checked-in/completed/no-show/cancelled) without a full page reload.
  - Empty states are handled (no appointments today, no recent patients).

### 8.3 Global Patient Search (Cmd+K)

- Accessible from anywhere in the app via keyboard shortcut and a visible search trigger.
- Searches patients by name (and optionally phone/DOB) within the current clinic.
- Selecting a patient offers: "View profile" and "Start consultation."
- **Acceptance criteria:**
  - "Start consultation" on a patient with no appointment today auto-creates a same-day appointment with `is_walk_in = true` and status progressing to `completed` on consultation save, then routes to `/patients/[id]/consultations/new`.
  - Search is limited to the receptionist's/doctor's own clinic.
  - Receptionist sees "View profile" only, not "Start consultation."

### 8.4 Patients (`/patients`, `/patients/[id]`)

- List view: searchable/filterable table of patients in the clinic.
- Create/edit patient via form (name, DOB, sex, contact info, etc.).
- Patient profile is the central screen and surfaces, above the fold:
  - Active allergies (severity, reaction)
  - Active problem list (chronic conditions, status)
  - Active/recent medications (derived from recent prescriptions)
  - Upcoming appointments
  - Consultation timeline (reverse chronological)
- **Acceptance criteria:**
  - Allergies and problem list are structured data (own tables), not free-text fields, and are editable independently of a consultation.
  - Patient records are never hard-deleted (soft delete via `deleted_at`).

### 8.5 Appointments (`/appointments`)

- Day-view calendar/list of appointments across the clinic (filterable by doctor).
- Status: `scheduled`, `checked-in`, `completed`, `no-show`, `cancelled`.
- Create/edit via form: patient, doctor, date/time, reason (optional), status.
- **Acceptance criteria:**
  - Both doctor and receptionist roles can create/edit appointments.
  - Walk-in appointments created via the Cmd+K flow appear in this view identically to scheduled ones, flagged as walk-ins.

### 8.6 Consultations (`/patients/[id]/consultations/new`, `/patients/[id]/consultations/[id]`)

- Dedicated full-page form (not a modal), reached from a patient's profile or the walk-in flow.
- Fields: chief complaint, symptoms, observations, diagnosis, treatment, notes — all free text for MVP (no coded terminology).
- Linked to a patient, a doctor, and an appointment (scheduled or auto-created walk-in).
- On save, doctor may optionally add to the problem list or create a prescription directly from the consultation.
- **Acceptance criteria:**
  - Only users with role `doctor` can access these routes (server-enforced).
  - Consultation is linked to exactly one appointment; appointment status is updated to `completed` on save.
  - Consultations are directly editable in MVP (no amendment/audit trail required yet).

### 8.7 Prescriptions

- Created from within a consultation (or from a patient's profile, linked back to a consultation).
- Each prescription has one or more `prescription_items` (medication, dosage, frequency, duration, instructions).
- Exportable/printable as a PDF resembling a prescription pad (clinic name/logo, doctor name, patient name/DOB, itemized medications, date, signature line).
- **Acceptance criteria:**
  - PDF generation uses `@react-pdf/renderer`.
  - PDF includes clinic branding (logo via Supabase Storage, if uploaded) and is print-friendly (correct page size/margins).
  - Prescription is permanently linked to its originating consultation.

## 9. Data Model

```
clinics
  id, name, logo_url, created_at

users
  id, clinic_id, role (doctor | receptionist), name, email, ...

patients
  id, clinic_id, name, dob, sex, contact_info, deleted_at

allergies
  id, patient_id, substance, severity, reaction

problems
  id, patient_id, condition, status (active | resolved), onset_date

appointments
  id, clinic_id, patient_id, doctor_id, scheduled_at, status, is_walk_in

consultations
  id, patient_id, doctor_id, appointment_id, chief_complaint, symptoms,
  observations, diagnosis, treatment, notes, created_at

prescriptions
  id, consultation_id, created_at

prescription_items
  id, prescription_id, medication, dosage, frequency, duration, instructions
```

Relationships: patients, appointments, consultations, and prescriptions are all scoped through `clinic_id` (directly or via patient/doctor). Prescriptions belong to consultations. Problems and allergies belong to patients directly.

## 10. Routes

```
/login
/dashboard
/patients
/patients/[id]
/patients/[id]/consultations/new
/patients/[id]/consultations/[id]
/appointments
```

## 11. Tech Stack

| Layer           | Choice                                                                      |
| --------------- | --------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19, TypeScript                               |
| Styling / UI    | Tailwind CSS + shadcn/ui                                                    |
| Forms           | React Hook Form + drizzle-zod (via shadcn `Form`)                           |
| ORM / Database  | Drizzle ORM + Supabase Postgres                                             |
| File Storage    | Supabase Storage (clinic logo, doctor signature)                            |
| Auth            | Better Auth — OAuth only (GitHub, Google); role- and clinic-scoped sessions |
| Validation      | Zod                                                                         |
| Data layer      | Server Components + Server Actions (no client-side query library)           |
| PDF generation  | @react-pdf/renderer                                                         |
| Testing         | Playwright (introduced once core flows are stable)                          |
| Package manager | pnpm                                                                        |
| Deployment      | Vercel                                                                      |

## 12. Key UX Principles (for reference during implementation)

- The patient profile, not the dashboard, is the app's center of gravity.
- Consultation recording is a dedicated, uninterrupted full-page flow — never a modal.
- Allergies and active problems must be visible without navigation (no click-through required) from the patient profile.
- Walk-ins are first-class, not a workaround — the appointment record is always the single source of truth for a visit, whether scheduled or ad hoc.
- All authorization checks (role, clinic scoping) are enforced server-side, never solely in the UI.
