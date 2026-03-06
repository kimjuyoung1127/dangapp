# frontend CLAUDE.md

## Project
DangApp frontend for a location-aware guardian and companion pet-care service.

## Required Skill Patterns
Detailed instructions live in `.claude/skills/{name}/SKILL.md`.
- SKILL-01: CVA Component Factory -> `.claude/skills/dangapp-cva-factory/SKILL.md`
- SKILL-02: cn() Merge Guard -> `.claude/skills/dangapp-cva-factory/SKILL.md`
- SKILL-03: Motion Wrapper Pattern -> `.claude/skills/dangapp-motion-wrapper/SKILL.md`
- SKILL-04: App Shell Layout -> `.claude/skills/dangapp-app-shell/SKILL.md`
- SKILL-05: Supabase Data Hook -> `.claude/skills/dangapp-supabase-hook/SKILL.md`
- SKILL-06: Skeleton Factory -> `.claude/skills/dangapp-skeleton-factory/SKILL.md`
- SKILL-07: Form Step Pattern -> `.claude/skills/dangapp-form-step/SKILL.md`
- SKILL-08: Trust Visual Pattern -> `.claude/skills/dangapp-trust-visual/SKILL.md`

## Frontend Rules
- Add a brief top-of-file comment to newly created code files when the role is not obvious.
- When creating a new folder, add a local `CLAUDE.md` describing its role and conventions.
- Before adding a new route or feature module, use `subagent-pattern-collect` to gather the closest existing pattern.

## Avoid
- Branching `className` manually when a CVA variant should handle it.
- Calling Supabase directly from components when a hook should own the data flow.
- Showing custom loading spinners when a skeleton pattern already exists.
- Using raw motion props when the motion wrapper pattern covers the case.
- Default font stacks such as Inter or Roboto without a deliberate design decision.
- Default `rounded-md` or `rounded-lg` drift when the component family already defines radius usage.

## Build and Run
Run frontend commands inside `frontend`.
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Tokens and Stack
- Design tokens: `tailwind.config.ts`
- Stack: Next.js 14.2, TypeScript 5 strict, Tailwind 3.4, Framer Motion 12, CVA, clsx, tailwind-merge, RHF, Zod, Zustand, TanStack Query, Supabase
