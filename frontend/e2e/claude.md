# E2E Folder Guide

## Role
- This folder owns browser-level QA scenarios for release stabilization.
- Focus on reproducible route flows and redirect behavior, not visual perfection.

## Structure
- `routes.public.spec.ts`
  - Unauthenticated route behavior checks (`/login`, `/register`, protected-route redirects).
- `routes.signed.spec.ts`
  - Signed-in flow checks across main routes using Playwright `storageState`.

## Rules
- Keep tests deterministic and route-centric.
- Use explicit route assertions (`toHaveURL`) and avoid brittle CSS selectors.
- Signed-in tests must be skippable when `E2E_STORAGE_STATE` is not provided.
- Store artifacts under `output/playwright/e2e/latest`.
