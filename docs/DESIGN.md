---
name: CliniCare
description: Practice management web application for individual doctors and small multi-doctor clinics
colors:
  primary: "#141618"
  primary-foreground: "#FAFAF7"
  neutral-bg: "#FAFAF7"
  neutral-surface: "#FFFFFF"
  neutral-subtle: "#F7F6F2"
  neutral-border: "#D8D4CC"
  text-muted: "#5A5D61"
  clinical-critical: "#B91C1C"
  clinical-warning: "#D97706"
  clinical-resolved: "#166534"
typography:
  display:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "1px"
  md: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
---

# Design System: CliniCare

## Overview

**Creative North Star: "The Pathology Lab Report"**

CliniCare rejects generic SaaS card-grid sprawl in favor of the structured clinical document format that doctors and GPs already trust implicitly. Information is organized with the rigor of a clinical report: crisp rules, labelled sections, tabular data formatting, and unmistakable severity flags. The interface functions as an extension of the doctor's diagnostic instrument, prioritizing immediate cognitive scanability over decorative aesthetics.

**Key Characteristics:**
- **Two-Column Clinical Topology:** Persistent 30% left column anchoring patient demographics, critical allergies, and active problems; dynamic 70% right canvas holding the active clinical encounter or timeline.
- **Strict Color Parsimony:** 95% neutral ground and structured black rules; color is reserved strictly for clinical significance (critical red, warning amber, resolved green).
- **Tabular & Monospaced Metadata:** Dates, NHS numbers, dosages, and record IDs are rendered in monospaced tabular formatting to eliminate reading errors.

## Colors

The palette reproduces the tactile feeling of clean clinical report paper with high-contrast carbon ink and purposeful diagnostic signal colors.

### Primary
- **Carbon Black** (`#141618`): Used for primary headlines, active borders, section rules, and solid primary actions.
- **Form Paper Cream** (`#FAFAF7`): The default page background. A warm, non-glare clinical ground that reduces eye strain during prolonged surgery days.

### Secondary
- **Critical Flag Red** (`#B91C1C`): Reserved strictly for severe allergies (anaphylaxis risks) and urgent contraindications. Paired with `#FFF5F5` background for high-visibility alerts.
- **Warning Amber** (`#D97706`): Used for moderate sensitivities, precautions, and pending statuses. Paired with `#FFFDF5`.
- **Clinical Resolved Green** (`#166534`): Confirmed resolved medical conditions post-treatment and verified active clinic sessions.

### Neutral
- **Clean Surface White** (`#FFFFFF`): Used for active content panels, record cards, and table backgrounds.
- **Report Rule Gray** (`#D8D4CC`): 1px borders, subtle table row dividers, and field containers.
- **Muted Carbon** (`#5A5D61`): Secondary clinical copy, timestamps, and metadata labels.

### Named Rules
**The Diagnostic Color Rule.** Saturated color may never be used for branding, decoration, or general illustrations. Color indicates clinical status and safety warnings only.

## Typography

**Display & Headline Font:** Geist Sans (clinical workhorse grotesque with tight tracking and balanced weights).  
**Body Font:** Geist Sans with tabular numerals enabled (`font-feature-settings: "tnum" on`).  
**Metadata & Record Font:** Geist Mono (used for IDs, NHS numbers, clinical observation measurements, and dates).

### Hierarchy
- **Display** (Bold 700, 24px–28px, line-height 1.2, tracking -0.02em): Patient name on the clinical profile header.
- **Headline** (Bold 700, 14px–16px, uppercase, tracking 0.05em): Section titles (e.g., "KNOWN ALLERGIES & ADVERSE REACTIONS", "CLINICAL NOTES").
- **Body** (Regular 400 & Medium 500, 12px–13px, line-height 1.5): Chief complaints, symptoms, observations, and consultation narratives.
- **Label** (Bold 700, 10px–11px, uppercase, monospaced, tracking 0.08em): Record numbers, category badges, table headers, and timestamps.

### Named Rules
**The Tabular Precision Rule.** Every medical timestamp, blood pressure reading, dosage quantity, and identification number must be formatted with tabular numerals to ensure vertical alignment across clinical logs.

## Layout

- **Desktop Framework:** Two-column split canvas. Left column (30–32% width, sticky) carries patient identity, allergies, and chronic conditions. Right column (68–70% width) carries encounters, timeline, prescriptions, and visit logs.
- **Mobile Responsive Behavior:** Fluid single column stack. Left summary section gracefully precedes the tabbed encounter canvas. Sticky top bar retains access to the patient name and one-tap consultation initiation.
- **Spacing Scale:** Built on strict 4px increments. Dense vertical rhythm with generous section separation.

## Elevation & Depth

CliniCare uses flat tonal layering and precise 1px borders rather than soft blur shadows. Depth is communicated through structural rules and deliberate high-contrast contrast.

### Shadow Vocabulary
- **Hard Technical Edge** (`box-shadow: 1px 1px 0px #141618`): Used sparingly on consultation summary blocks and primary interactive cards to signal actionable boundaries.

### Named Rules
**The No-Glass Rule.** Translucent glassmorphism, blur backdrops, and floating pill shadows are strictly prohibited in the clinical interface. Boundaries are marked with honest 1px rules.

## Shapes

- **Corner Strategy:** Sharp, clinical 1px–2px radii. Buttons and containers have crisp, square-adjacent geometry (`border-radius: 1px` to `2px`). Pill shapes are prohibited on clinical containers.
- **Rules & Dividers:** 1px solid `#141618` for primary structural boundaries; 1px `#D8D4CC` for sub-item dividers.

## Components

### Buttons
- **Shape:** Rectangular (`rounded-sm`, 1px–2px).
- **Primary Action:** Solid carbon black background (`#141618`), warm paper text (`#FAFAF7`), bold uppercase 12px monospaced/grotesque text. Hover shifts to `#000000`.
- **Outline Action:** 1px carbon border with clean white fill, hover inverting to solid black fill.

### Status Badges & Severity Chips
- **Critical Allergy:** 1px border `#B91C1C` with solid `#B91C1C` badge and bold uppercase text.
- **Status Flag:** 1px border `#141618` with solid fill for active items, subtle green outline for resolved items.

### Consultation Timeline Record
- **Format:** Structured document card with header banner, complaint/diagnosis grid, and collapsible physical examination & vitals block.
- **Expand/Collapse Interaction:** Immediate disclosure triangle with border-t divider; never opens an interruptive modal.

## Do's and Don'ts

### Do:
- **Do** keep allergies and chronic problems visible at all times on the desktop patient profile.
- **Do** format all dates in UK standard format (`DD/MM/YYYY`).
- **Do** present consultations in strict reverse-chronological order.
- **Do** maintain a permanent, accessible "Start Consultation" CTA in the top header.

### Don't:
- **Don't** use decorative gradients, glass blur, or floating rounded cards.
- **Don't** bury allergy alerts inside dropdowns, accordions, or secondary tabs.
- **Don't** wrap consultation recording in a modal window — consultations require full-page dedicated focus.
- **Don't** use generic consumer colors or playful emoji in medical records.
