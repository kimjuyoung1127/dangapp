// File: Optional signed-in route flow checks using Playwright storage state.
import { expect, test } from "@playwright/test";

const storageStatePath = process.env.E2E_STORAGE_STATE;

if (storageStatePath) {
    test.use({ storageState: storageStatePath });
}

const signedRoutes = ["/home", "/chat", "/schedules", "/modes", "/care", "/family", "/profile"];

test.describe("Signed-in route QA @signed", () => {
    test.skip(!storageStatePath, "E2E_STORAGE_STATE is missing. Skipping signed-in checks.");

    test("core signed-in routes do not bounce to login", async ({ page }) => {
        for (const route of signedRoutes) {
            await page.goto(route);
            await expect(page).not.toHaveURL(/\/login/);
        }
    });

    test("chat detail route opens when a room exists", async ({ page }) => {
        await page.goto("/chat");
        await expect(page).not.toHaveURL(/\/login/);

        const roomLink = page.locator('a[href^="/chat/"]').first();

        if (await roomLink.count()) {
            await roomLink.click();
            await expect(page).toHaveURL(/\/chat\/.+/);
            return;
        }

        await expect(page.getByText(/아직 진행 중인 대화가 없어요|채팅/)).toBeVisible();
    });
});
