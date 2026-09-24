# Implementation Plan: Phase 0 — Project Foundation

## Objective
Establish the project foundation for CliniCare: runtime and dev dependencies, environment variables and `.gitignore` rules, lightweight Vitest test runner configuration, TypeScript path aliases, and standard folder scaffolding, ensuring a clean zero-error baseline (`pnpm build` and `pnpm test` exit 0).

---

## 1. Context & Architecture Alignment

Per `docs/ROADMAP.md` (Phase 0) and `docs/ARCHITECTURE.md`:
- **Lightweight Logic-Only Testing:** Vitest is configured in pure Node mode (no jsdom, no React testing library, no component test overhead). Tests will target Zod schemas, session helpers, queries, and mutations.
- **Architectural Boundaries:** Business logic and domain queries/mutations belong in `features/<domain>`, session/DB/storage helpers in `lib/`, shared UI primitives in `components/ui/`, and shell navigation in `components/layout/`.
- **Package Manager:** Strict adherence to pnpm version matching `package.json` (`12.4.2`).

---

## 2. Step-by-Step Execution Plan

### Step 1: Install Runtime & Dev Dependencies
Run the required dependency installation using `pnpm`:
```bash
pnpm add drizzle-orm @supabase/supabase-js better-auth react-hook-form zod drizzle-zod @react-pdf/renderer next-themes
pnpm add -D drizzle-kit vitest vite-tsconfig-paths tsx
```

Verify `package.json`:
- Confirm all specified dependencies are present.
- Confirm `"packageManager": "pnpm@12.4.2"` matches the installed version (`pnpm --version` -> `12.4.2`).

### Step 2: Environment Configuration & Git Tracking
1. **Create [`.env.example`](file:///home/darkside/projects/clinicare/.env.example)** with all documented environment variables (unpopulated template):
   ```ini
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
2. **Update [`.gitignore`](file:///home/darkside/projects/clinicare/.gitignore)**:
   - Ensure `.env*` ignores real environment secrets (`.env`, `.env.local`, `.env*.local`) while explicitly allowing `.env.example`:
     ```gitignore
     # env files
     .env*
     !.env.example
     ```
3. **Create local [`.env.local`](file:///home/darkside/projects/clinicare/.env.local)** with development placeholder values or appropriate local URLs.

### Step 3: Vitest Test Runner Configuration
1. **Create [`vitest.config.ts`](file:///home/darkside/projects/clinicare/vitest.config.ts)** at project root:
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
       passWithNoTests: true,
     },
   });
   ```
   *(Note: `passWithNoTests: true` guarantees `pnpm test` exits 0 when 0 test suites are collected initially).*
2. **Update [`package.json`](file:///home/darkside/projects/clinicare/package.json)** scripts:
   - Add `"test": "vitest run"`
   - Add `"test:watch": "vitest"`

### Step 4: TypeScript & Path Aliases Verification
1. **Update [`tsconfig.json`](file:///home/darkside/projects/clinicare/tsconfig.json)**:
   - Add `"baseUrl": "."` explicitly to `compilerOptions` alongside `"@/*": ["./*"]` path mappings.
2. Confirm [`next.config.ts`](file:///home/darkside/projects/clinicare/next.config.ts) is valid.

### Step 5: Folder Scaffolding
Create empty target directories and place `.gitkeep` in leaf directories that do not yet contain code:
- `features/patients/components/.gitkeep`
- `features/appointments/components/.gitkeep`
- `features/consultations/components/.gitkeep`
- `features/prescriptions/components/.gitkeep`
- `features/prescriptions/pdf/.gitkeep`
- `lib/auth/.gitkeep`
- `lib/db/.gitkeep`
- `lib/supabase/.gitkeep`
- `components/layout/.gitkeep`

---

## 3. Verification & Acceptance Criteria

| Check | Action / Command | Success Criteria |
|---|---|---|
| Package Manager Check | `pnpm --version` | Matches `packageManager` field in `package.json` (`12.4.2`). |
| Gitignore Check | `git check-ignore -v .env.example` | Does not ignore `.env.example`. |
| Gitignore Check | `git check-ignore -v .env.local` | Successfully ignored by `.gitignore`. |
| Test Runner Check | `pnpm test` | Vitest runs, collects 0 tests, exits with code 0. |
| Build Check | `pnpm build` | Next.js build finishes with exit code 0. |
| Directory Structure | `ls -la features/ lib/ components/` | All required subdirectories present. |

---

## 4. Post-Execution Checklist
- Update [docs/ROADMAP.md](file:///home/darkside/projects/clinicare/docs/ROADMAP.md) checklist items 0.1 through 0.5 from `[ ]` to `[x]`.
- Provide git status and suggested conventional commit command.
