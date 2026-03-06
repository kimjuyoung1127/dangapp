// File: Playwright config for local route QA (unauth required + optional signed-in storage-state flow).
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ["list"],
        ["json", { outputFile: "../output/playwright/e2e/latest/results.json" }],
        ["html", { outputFolder: "../output/playwright/e2e/latest/html-report", open: "never" }],
    ],
    use: {
        baseURL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    outputDir: "../output/playwright/e2e/latest/test-results",
    webServer: {
        command: `npx next dev --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        cwd: ".",
        reuseExistingServer: true,
        timeout: 120_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "chrome",
            use: {
                ...devices["Desktop Chrome"],
                channel: "chrome",
                launchOptions: {
                    args: ["--disable-blink-features=AutomationControlled"],
                    ignoreDefaultArgs: ["--enable-automation"],
                },
            },
        },
    ],
});
