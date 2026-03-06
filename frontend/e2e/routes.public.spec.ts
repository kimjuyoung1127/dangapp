// File: Public/unauthenticated route regression checks for auth and protected-route redirects.
import { expect, test } from "@playwright/test";

const protectedRoutes = [
    "/home",
    "/chat",
    "/schedules",
    "/danglog",
    "/profile",
    "/modes",
    "/care",
    "/family",
];

test.describe("Public route QA @unauth", () => {
    test("login and register render expected auth entry controls", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();

        await page.goto("/register");
        await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    });

    test("protected routes redirect to /login when unauthenticated", async ({ page }) => {
        for (const route of protectedRoutes) {
            await page.goto(route);
            await expect(page).toHaveURL(/\/login/);
        }
    });

    test("auth callback without code redirects to login error", async ({ page }) => {
        await page.goto("/auth/callback");
        await expect(page).toHaveURL(/\/login\?error=(missing-auth-code|auth-code-error)/);
    });
});
