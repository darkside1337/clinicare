# CliniCare

**Focused practice management for solo practitioners and small clinics.**
*Patient lookup to prescription without EMR overhead, in a design system inspired by the pathology lab report.*

![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-black?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle)
![Tailwind](https://img.shields.io/badge/Tailwind-v4%20%2B%20shadcn%2Fui-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

![CliniCare dashboard](public/demo/screenshots/01-dashboard.png)

> **Demo project.** CliniCare is a portfolio application. It is not certified for HIPAA, GDPR or any other regulatory framework, and it must not be used with real patient data. All seed data is fictional.

---

## Table of contents

1. [Overview](#1-overview)
2. [Core workflows](#2-core-workflows)
3. [Architecture and multi-tenancy](#3-architecture-and-multi-tenancy)
4. [Tech stack](#4-tech-stack)
5. [Getting started](#5-getting-started)
6. [Demo sandbox and scripts](#6-demo-sandbox-and-scripts)
7. [Scope and known limitations](#7-scope-and-known-limitations)
8. [Documentation](#8-documentation)

---

## 1. Overview

CliniCare is a practice-management web app for individual doctors and small clinics (1-5 practitioners). It covers the core clinical loop: identifying a patient, managing appointments, charting a consultation, and issuing a prescription. It leaves out hospital EMR complexity, billing and enterprise workflows on purpose.

The interface is designed as an extension of the clinician's working tools rather than a generic SaaS dashboard. The full rules live in [`DESIGN.md`](DESIGN.md):

- **Lab report aesthetic.** Carbon ink (`#141618`) on warm, glare-free paper (`#FAFAF7`), flat tonal layers and crisp 1px rules. No decorative gradients, glassmorphism or playful animation.
- **Persistent 30/70 layout.** A sticky left column keeps patient identity, allergies and active problems in view at all times. The right canvas holds the chronological encounter record.
- **Restrained color.** About 95% of the UI is neutral. Saturated color is reserved for clinical meaning: Critical Red (`#B91C1C`) for severe allergies, Warning Amber (`#D97706`) for sensitivities, Resolved Green (`#166534`) for cleared conditions.
- **Tabular precision.** Tabular numerals for measurements, blood pressure and dosages, and unambiguous `DD/MM/YYYY` dates, to reduce reading errors.

---

## 2. Core workflows

### Flow 1: Command palette and walk-ins

A global `Cmd/Ctrl+K` palette searches patients by name, date of birth or NHS number, and can create a same-day walk-in appointment in one step.

![Global command palette](public/demo/screenshots/02-command-palette.png)

### Flow 2: Patient directory and longitudinal chart

A dense, searchable patient roster leads into a two-column chart. Allergies and the chronic problem list stay pinned on the left, and the encounter timeline runs on the right.

| Patient directory | Clinical chart |
| --- | --- |
| ![Patient directory](public/demo/screenshots/03-patients-list.png) | ![Patient profile](public/demo/screenshots/04-patient-profile.png) |
| Tabular roster with real-time filtering, calculated age and contact details. | Pinned allergy chips, problem list and past encounters. |

### Flow 3: Encounter notes and daily schedule

Consultations open as a dedicated full page, never a modal, so the physician can focus on chief complaint, diagnoses and narrative. The daily schedule tracks each visit through *Scheduled, Arrived, In Consultation, Completed*.

| Consultation | Daily schedule |
| --- | --- |
| ![New consultation](public/demo/screenshots/05-consultation-new.png) | ![Daily appointments](public/demo/screenshots/06-appointments-day.png) |
| Full-page encounter form with symptoms, notes and prescription linking. | Time-blocked grid with check-in status transitions. |

### Flow 4: Prescriptions and printable Rx

Multi-item prescriptions with dosage instructions and quantities are authored during the consultation, then rendered to a vector PDF with `@react-pdf/renderer`, including clinic letterhead, doctor details and a signature block.

![Prescription slip](public/demo/screenshots/07-prescription.png)

---

## 3. Architecture and multi-tenancy

The boundaries below are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md):

1. **Tenant isolation.** Every query and mutation on clinical records (`patients`, `appointments`, `consultations`, `prescriptions`, `allergies`, `problems`) takes and filters by `clinic_id`, and this is covered by tests.
2. **Two roles, enforced on the server.**
   - **Doctor:** full clinical documentation, including problems, allergies, consultations and prescriptions.
   - **Receptionist:** patient registration and appointment scheduling only. Consultation and prescription routes are blocked in `lib/auth/guards.ts`, not just hidden in the UI.
3. **Thin routes.** App Router routes in `app/` only orchestrate. Business logic and data access live in feature modules (`features/<domain>/{queries,mutations}.ts`).
4. **Soft deletes.** Patient charts and medical records use `deleted_at` timestamps, so clinical history is never hard-deleted.
5. **Full-page consultations.** Clinical encounters are dedicated routes, not modal windows.
6. **Hardened auth.** `clinicId` and `role` are not settable from client input in Better Auth, and new accounts default to the least-privileged role (receptionist).

---

## 4. Tech stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) | App Router, Turbopack, Server Actions, React Server Components |
| UI | [React 19](https://react.dev/) | Modern action hooks |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Custom token system, Lucide icons |
| Database | [Supabase Postgres](https://supabase.com/) + [Drizzle ORM](https://orm.drizzle.team/) | Drizzle Kit migrations, type-safe schema, drizzle-zod |
| Auth | [Better Auth](https://www.better-auth.com/) | Role-based sessions (Doctor / Receptionist) |
| Validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Shared client and server schemas |
| PDF | [`@react-pdf/renderer`](https://react-pdf.org/) | Vector prescription slips |
| Testing | [Vitest](https://vitest.dev/) | Unit and integration tests for domain logic |

---

## 5. Getting started

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable pnpm`)
- A Postgres database (Supabase or local)

### Installation

1. **Clone and install**

   ```bash
   git clone https://github.com/darkside1337/clinicare.git
   cd clinicare
   pnpm install
   ```

2. **Configure `.env.local`**

   ```bash
   DATABASE_URL="postgres://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]"
   BETTER_AUTH_SECRET="your-auth-secret-here"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   DEMO_MODE="true"   # enables the one-click demo login and the demo reset script
   ```

3. **Apply migrations and seed demo data**

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

   Migrations are already committed. Only run `pnpm db:generate` after you change the Drizzle schema.

4. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open <http://localhost:3000> and pick a demo staff member from the landing page.

---

## 6. Demo sandbox and scripts

With `DEMO_MODE=true`, the landing page offers one-click login as two fictional personas: **Dr. Sarah Chen** (doctor) and **James Wilson** (receptionist). Comparing the two is the quickest way to see the role separation in action.

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server (Turbopack) |
| `pnpm build` | Create a production build |
| `pnpm test` | Run the Vitest suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate SQL migrations from schema changes |
| `pnpm db:migrate` | Apply migrations to the target database |
| `pnpm db:seed` | Seed a sample clinic, staff personas and patients |
| `pnpm db:reset-demo` | Truncate and reset the demo database (requires `DEMO_MODE=true`) |

---

## 7. Scope and known limitations

CliniCare is intentionally an MVP. Deliberately out of scope:

- AI-assisted diagnosis
- Insurance, pharmacy and lab integrations
- Billing and complex medical coding
- Telemedicine and wearable data
- Multi-hospital or enterprise features

Known gaps:

- Consultations are editable in place. An append-only amendment and audit trail is planned for after the MVP.
- Any doctor in a clinic can view and treat any patient in that clinic. There is no per-doctor patient assignment.

---

## 8. Documentation

- [`docs/ROADMAP.md`](docs/ROADMAP.md): phased task breakdown and milestone progress
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): multi-tenancy boundaries, module structure and Server Action patterns
- [`docs/PRD.md`](docs/PRD.md): clinical requirements, domain models and feature specs
- [`DESIGN.md`](DESIGN.md): visual design tokens, typography and layout rules
- [`PRODUCT.md`](PRODUCT.md): product positioning, principles and personas
