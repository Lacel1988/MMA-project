import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const backendDirectory = path.join(__dirname, "backend");
const frontendDirectory = path.join(__dirname, "frontend");
const e2eDatabase = path.join(backendDirectory, "db.e2e.sqlite3");
const pythonExecutable = process.env.PLAYWRIGHT_PYTHON ?? "python";
const pythonCommand = pythonExecutable.includes(" ") ? `"${pythonExecutable}"` : pythonExecutable;

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  timeout: 30_000,
  expect: { timeout: 7_500 },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `${pythonCommand} e2e_prepare.py && ${pythonCommand} manage.py runserver 127.0.0.1:8000 --noreload`,
      cwd: backendDirectory,
      url: "http://127.0.0.1:8000/api/categories/",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        MMA_DATABASE_PATH: e2eDatabase,
        DJANGO_SECRET_KEY: "playwright-only-insecure-secret-key",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      cwd: frontendDirectory,
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
