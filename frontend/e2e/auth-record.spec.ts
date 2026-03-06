// File: Manual helper to record signed-in storage state for optional signed-route E2E checks.
import { expect, test } from "@playwright/test";
import path from "node:path";

const storageStateOutput =
    process.env.E2E_STORAGE_STATE_OUT ??
    path.resolve(process.cwd(), "../output/playwright/e2e/latest/storage-state.json");

test.describe("Auth state recorder @manual", () => {
    test("record storage state after manual login", async ({ page, context }) => {
        test.setTimeout(180_000);

        await page.goto("/login");
        await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();

        // User performs Google OAuth manually; this test waits for an authenticated landing page.
        await page.waitForURL(/\/(home|onboarding)/, { timeout: 160_000 });
        await context.storageState({ path: storageStateOutput });
    });
});
