# Global Patient Search Modal Surface Brief

Surface slug: `global-patient-search-modal`
Target file: `components/patient-search-dialog.tsx`

## Design Specifications
- **Visual Tone:** Pathology Lab Report
- **Palette:** `#FAFAF7` background, `#141618` borders and headers, `#5A5D61` metadata, `#B91C1C` alert flags.
- **Trigger:** Global hotkey `Cmd+K` / `Ctrl+K` and top navigation button.
- **Initial State:** Clean minimalist state with keyboard instruction pill.
- **Actions:**
  - Primary (Enter / Click): Open `/patients/[id]`
  - Secondary (Shortcut button): Start consultation `/patients/[id]/consultations/new`
- **Components:** Shadcn `Button`, `Input`, `Badge`.
