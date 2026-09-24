# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Doctor (`role: doctor`)**
A solo practitioner or one of several doctors in a small UK/European clinic. Using the app throughout a clinic day: between patients, during consultations, at the end of a surgery. Needs to move fast — finding a patient, recording a consultation, and generating a prescription must each feel effortless even under time pressure. Has full clinical access within their clinic.

**Secondary — Receptionist (`role: receptionist`)**
Front-desk staff. Manages patient records and the appointment calendar. Does not access any clinical documentation (consultations, prescriptions, medical history). Needs a clear, unambiguous view of who's in today and what's scheduled.

## Product Purpose

CliniCare is a practice-management web app for individual doctors and small multi-doctor clinics. It covers the core clinical workflow — patients, appointments, consultations, prescriptions — without the overhead of billing, insurance, lab integrations, or multi-hospital administration.

The patient record is the centre of gravity: a doctor should be able to search for a patient and immediately see their full clinical picture (problems, allergies, active medications, upcoming appointments, consultation history) from a single profile view. Consultation recording is a dedicated, uninterrupted full-page flow — never a modal.

Success means: a doctor can search, open a patient, record a consultation, and print a prescription in minimal steps, with no unnecessary clicks.

## Positioning

The gap between paper records and oversized enterprise EMR systems. Fast, focused, and opinionated about the clinical workflow rather than a generic SaaS dashboard with clinical data bolted on. The product mechanism: the patient profile — not a dashboard — is the primary UX surface and is designed around the doctor's in-consultation mental model.

## Operating Context

- Small UK/European clinics (1–5 doctors) and solo practitioners.
- Used on desktop/laptop during a busy clinic day; mobile not in scope.
- Date format: DD/MM/YYYY throughout; locale sensibility is UK/European.
- GDPR-adjacent context; no data fabrication (testimonials, benchmarks, pricing) acceptable.
- Both scheduled appointments and walk-ins (same-day, no prior booking) are first-class workflows.
- Clinic branding (logo, doctor signature) stored in Supabase Storage; may be absent at first run.

## Capabilities and Constraints

**In scope for MVP:**
- OAuth-only login via Better Auth (GitHub, Google); no email/password.
- Users must be pre-invited into a clinic with a role; new OAuth sign-ins with no clinic association see a "not yet set up" state.
- Clinic-scoped data isolation: all queries enforce `clinic_id`; no cross-clinic leakage.
- Role enforcement is server-side (not UI-only): receptionist cannot access consultation or prescription routes even by direct URL.
- Patient records soft-deleted only (`deleted_at`); never hard-deleted.
- Allergies and problem list are structured tables, not free-text.
- Walk-in appointments auto-created from Cmd+K search; always produce an appointment record.
- Prescriptions exportable as PDF via `@react-pdf/renderer`; include clinic branding and signature line.
- Consultations directly editable in MVP (no amendment/audit trail yet).

**Explicitly out of scope for MVP:**
AI diagnosis, insurance/billing, pharmacy/lab integrations, ICD-10/CPT coding, telemedicine, multi-clinic switching, per-doctor patient locking, consultation templates, multi-hospital admin.

**Tech stack:**
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Hook Form + Zod, Drizzle ORM + Supabase Postgres, Supabase Storage, Better Auth, @react-pdf/renderer, pnpm, Vercel.

## Brand Commitments

- Name: **CliniCare**
- No logo or tagline yet; assets to be supplied by owner.
- Voice: professional and efficient — clinical without being cold; no consumer-app chattiness.

## Evidence on Hand

- Full PRD at `docs/PRD.md` — confirmed product source of truth.
- Scaffolded Next.js 16 codebase (create-next-app baseline; no application routes or UI yet).
- shadcn/ui and base-ui installed; Tailwind v4; lucide-react icons.
- No logo, no photography, no patient or clinic data.

## Product Principles

1. **Speed first, everything else second.** Every extra click between arriving at the app and recording a consultation is a design failure.
2. **The patient profile is the product.** All roads lead to and from the patient view; dashboards and lists are navigation, not destinations.
3. **Two roles, hard separation.** Clinical data (consultations, prescriptions, medical history) is invisible to receptionists at every layer — not just hidden in the UI.
4. **Walk-ins are equal citizens.** The appointment record is always the source of truth for a visit; no clinical workflow should be possible without it, and no friction should exist creating one on the fly.
5. **Trust the doctor, verify the data.** Minimal mandatory fields; structured where it matters (allergies, problems, prescription items); free text where clinical judgment is irreducible.
