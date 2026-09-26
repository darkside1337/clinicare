---
version: 1
slug: "app-app-dashboard-page-tsx"
primary_target: "app/(app)/dashboard/page.tsx"
related_targets: []
---

## Surface Brief: Practice Dashboard `/dashboard`

**Mode:** Operate  
**Visitor:** A doctor (e.g. Dr. Alistair Finch) arriving at morning clinic or switching between appointment blocks; secondary view for receptionist (Riley) checking in arrivals.  
**Job:** See today's full appointment list, filter by practitioner, check who is waiting in the surgery, update appointment status instantly without full page reloads, trigger same-day walk-in consultations, and jump directly into active patient profiles.  
**Success:** Doctor immediately sees the next waiting patient, can transition status (`scheduled` → `checked-in` → `in-consultation` / `completed`) in-line, and can launch a walk-in encounter in one click.

---

## 1. Selected Direction & Visual Authority

- **Visual World:** Grounded in the confirmed **Pathology Lab Report** design system ([`DESIGN.md`](file:///home/darkside/projects/clinicare/DESIGN.md)).
- **Palette:** Warm clinical paper ground (`#FAFAF7`), carbon black ink (`#141618`), precise 1px hairline rules (`#D8D4CC`), and purposeful diagnostic status tags (`#166534` completed, `#D97706` waiting/checked-in, `#B91C1C` alert/no-show).
- **Typography:** Geist Sans with tabular numerals (`font-feature-settings: "tnum" on`) for timestamps and time-slots, Geist Mono for record IDs and NHS numbers.

---

## 2. Layout & Spatial Topology

- **Header Bar:**
  - Clinic identity: `CLINICARE / REF: 2026-UK`.
  - Date banner with UK format (`DD/MM/YYYY`) and current clinic day status.
  - Doctor switch dropdown / filter (e.g. "All Clinicians", "Dr. Alistair Finch", "Dr. Helen Rostova").
  - Quick action buttons: **"Start Walk-In"** (high emphasis) and **"Register Patient"**.
- **Split Queue Canvas (Two-Column on Desktop):**
  - **Left Primary Column (~68% width): Today's Clinic Schedule & Patient Queue**
    - Chronological list of today's booked encounters.
    - Each row shows: Time slot (`09:00`, `09:30`), Patient Name + NHS number, Encounter Type badge (`Scheduled` vs `Walk-In`), Assigned Doctor, Reason for Visit, and interactive Status Chip.
    - Status chip enables instant inline status updates (`scheduled` → `checked-in` → `completed` → `no-show` → `cancelled`) via an accessible popover/dropdown without leaving the screen.
    - "Call Patient / Start Consultation" action row for checked-in patients routing to `/patients/[id]/consultations/new`.
  - **Right Supporting Column (~32% width): Clinical Quick Actions & Recent Patients**
    - **Surgery Overview Metric Block:** Total Booked, Waiting in Surgery, Completed, No-Shows.
    - **Recent Patients Strip:** Quick-jump cards of the last 5 accessed patient records with allergy warning indicators.
    - **Walk-In Action Panel:** Direct entry for unregistered or ad-hoc arrivals.

---

## 3. States & Content Ranges

- **Schedule Density:**
  - Typical day: 8–18 appointments.
  - Peak clinic day: 25+ appointments (scrollable list with time headers: Morning Surgery 08:30–12:30, Afternoon Clinic 14:00–18:00).
  - Empty state: "No appointments scheduled for today" with a clear CTA to book or launch a walk-in.
- **Receptionist View State:**
  - Consultation trigger buttons are hidden.
  - Check-in and arrival actions become primary.
- **Mobile Responsive Behavior:**
  - Stacks single-column: Surgery overview stats on top, followed by chronological schedule with touch-friendly status switchers.

---

## 4. Constraints & Rules

- Date format: `DD/MM/YYYY` throughout.
- All queries and mutations must enforce `clinic_id`.
- Role check: Doctor vs. Receptionist view permissions respected.
- Soft-delete: Exclude soft-deleted patients from recent and schedule lists.
- Uses Shadcn UI primitives (`<Button>`, `<Card>`, `<Input>`, `<Select>`, `<Badge>`, `<Popover>`) per project rules.
