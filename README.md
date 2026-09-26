# CliniCare — Practice Management System

CliniCare is a fast, focused practice-management web application for individual doctors and small multi-doctor clinics — covering patients, appointments, consultations, and prescriptions without hospital/EMR overhead.

Built on Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI primitives, Drizzle ORM, Supabase Postgres, and Better Auth.

---

## Key Features

- **The Pathology Lab Report Design**: Minimalist clinical document styling prioritizing rapid cognitive scanability over generic SaaS dashboards. High contrast carbon ink (`#141618`) on warm paper ground (`#FAFAF7`) with monospaced tabular figures.
- **Strict Multi-Tenancy**: Application-level tenancy isolation scoped to `clinic_id` on every clinical query and mutation.
- **Role-Based Authorization**:
  - **Doctor (`role: doctor`)**: Complete clinical access — patient profiles, medical problems, allergies, consultation encounters, and itemized prescription authoring.
  - **Receptionist (`role: receptionist`)**: Front-desk operations — patient registration and appointment scheduling, strictly excluded from clinical consultation documentation.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Instant patient search across name, DOB, phone, and email, with one-click walk-in appointment creation and consultation launch.
- **Prescriptions & Vector PDF Export**: Atomic multi-item prescription orders attached to consultations with single-prescription vector PDF generation via `@react-pdf/renderer`.

---

## Tech Stack

- **Framework**: Next.js 16.3 (Turbopack, App Router, Server Actions)
- **UI & Components**: React 19, Tailwind CSS v4, Base UI, Shadcn UI primitives, Lucide Icons
- **Database & ORM**: Supabase Postgres, Drizzle ORM, Drizzle Zod
- **Authentication**: Better Auth (OAuth via GitHub/Google + local sandbox testing sessions)
- **Forms & Validation**: React Hook Form, Zod
- **PDF Generation**: `@react-pdf/renderer`
- **Testing**: Vitest, React Testing Library

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 12+ (`corepack enable pnpm`)
- Postgres database (Supabase or local instance)

### Installation

1. Install project dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   DATABASE_URL="postgres://..."
   BETTER_AUTH_SECRET="your-auth-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. Run migrations and database seed:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the landing page and sandbox gateway.

---

## Scripts & Development

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts Next.js development server with Turbopack |
| `pnpm build` | Builds optimized production bundle |
| `pnpm test` | Runs pure-logic Vitest test suite |
| `pnpm test:watch` | Runs test runner in watch mode |
| `pnpm db:generate` | Generates SQL migrations from Drizzle schema |
| `pnpm db:migrate` | Applies migrations to target Postgres database |
| `pnpm db:seed` | Populates database with sample clinic, staff personas, and patients |

---

## Architecture & Documentation

- [docs/ROADMAP.md](docs/ROADMAP.md) — Phased task breakdown and development progress
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Multi-tenancy model, folder boundaries, and Server Actions patterns
- [docs/PRD.md](docs/PRD.md) — Product requirements, domain models, and feature specifications
- [DESIGN.md](DESIGN.md) — Visual design tokens, typography, and "Pathology Lab Report" layout guidelines
- [PRODUCT.md](PRODUCT.md) — Product positioning, operational principles, and personas
