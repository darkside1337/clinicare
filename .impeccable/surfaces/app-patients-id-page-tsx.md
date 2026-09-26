---
version: 1
slug: "app-patients-id-page-tsx"
primary_target: "app/patients/[id]/page.tsx"
related_targets: []
---

## Surface brief: Patient Profile `/patients/[id]`

**Mode:** Operate  
**Visitor:** A doctor mid-clinic-day, switching between patients. Arrives from the Cmd+K search or from the dashboard appointment list. Has 2–3 minutes between consultations; knows exactly who they're looking for.  
**Job:** See the full clinical picture of one patient at a glance — current problems, allergies, active medications, recent consultations — and either act (start consultation, add prescription) or confirm a fact.  
**Success:** Doctor lands on the profile and has the critical clinical information (allergies, active problems) without scrolling or navigating tabs. They can initiate a consultation in one click from anywhere on the page.

---

## Direction contract

**THESIS:** The patient profile formatted as a clinical document the doctor already reads — a structured pathology/haematology result sheet. Data is presented as a record, not assembled from UI widgets. Refuses the dashboard-widget arrangement where every piece of data competes equally behind a card border.

**OWN-WORLD:** Warm near-white ground (not pure white — closer to clinical form paper, ~#FAFAF7), precise black rules between sections, bold section header labels in tracked small caps or tight uppercase, data in a workhorse medical grotesk face (not Inter, not a display serif — something with the density and authority of Helvetica Neue or Aktiv Grotesk; the Google Fonts closest equivalent that passes the face-check, not a named default). Clinical flag colors are the only color on the surface: critical red (#B91C1C), resolved green (#166534), warning amber (#92400E). Status chips are restrained — small, labeled, flush to the section line, not pill badges floating in white space.

**STORY:** Doctor opens the profile. The left column — narrow, persistent — shows patient identity (name large, DOB, sex, NHS number or clinic ID) followed immediately by the allergy section (substance, severity, reaction) and then the active problem list (condition, status, onset). These sections never collapse. The right column shows the active section: consultation timeline by default. Doctor sees the record has a bee sting allergy flagged critical before reading anything else. They click "Start consultation" in the pinned header bar and are routed to `/patients/[id]/consultations/new`.

**FIRST VIEWPORT:** Two-column layout. Left column: ~30% width, fixed/sticky on scroll. Sections stacked vertically — Patient header (name at ~28px bold, DOB/sex/ID at 13px muted), then a ruled section "Allergies" with each allergy as a label-value row with a severity chip, then "Active Problems" with condition + status flag + onset date. Right column: ~70% width. Pinned header bar at top (~48px): patient name repeated small, then primary action "Start consultation" (solid, right-aligned). Below: section switcher as a tight horizontal rule list (Consultations · Appointments · Prescriptions · Medications), then the content of the active section. Default section: consultation timeline, entries newest-first, each as a structured record block — date + doctor name as the header rule, then chief complaint and diagnosis as the prominent text, with a "View full" link.

**FORM:** Pathology Lab Report — chosen from IMPECCABLE'S PICK (position 2 on the ordered list). Seed key: `b7c3cf0d`.

**FINISH:** Unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

---

## States and content ranges

- **Allergies:** 0 (show "No known allergies" as a positive statement, not empty), 1–3 (typical), 5+ (dense, no truncation — all visible)
- **Active problems:** 0 (show "No active problems recorded"), 1–5 (typical), 10+ (scrollable within the left column section)
- **Consultations:** 0 (empty state: "No consultations recorded — start one above"), 1, 5, 20+ (paginated or virtualized, newest first)
- **Receptionist view:** Left column shows demographics only; allergy and problem sections hidden (server-enforced); right column shows Appointments tab only; "Start consultation" action absent
- **No-clinic user:** Redirected before reaching this route

---

## Constraints and open decisions

- Route: `/patients/[id]` — dynamic segment
- Role enforcement: server-side; receptionist cannot see clinical sections even via direct URL
- Clinic scoping: all data queries enforce `clinic_id`
- Date format: DD/MM/YYYY throughout
- Stack: Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui components
- No image assets available at build time (clinic logo may be absent)
- Soft-deleted patients (`deleted_at`) must not be reachable via this route
- PDF prescription generation is out of scope for this surface (linked from consultation)
- **Open:** exact Google Fonts face to pass the face-check for body copy (workhorse medical grotesk character — builder must run font-match or equivalent check)
- **Open:** whether left column scrolls independently or the whole page scrolls with left column sticky
