import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const BASE_URL = process.env.BASE_URL || "https://glowngrace-dev.vercel.app";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    headless: false,
    trace: "on-first-retry",
    screenshot: "on",
    video: "on-first-retry",
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  expect: {
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium-headed",
      use: { ...devices["Desktop Chrome"], headless: false },
    },
  ],
});
