import { test, expect } from "@playwright/test";

test.describe("Candidate portal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("candidate@glowngrace.in");
    await page.getByLabel("Password").fill("candidate123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/candidate/);
  });

  test("redirects to /candidate after login", async ({ page }) => {
    await expect(page).toHaveURL(/\/candidate/);
  });

  test("shows Edit Profile, Preview Profile, Applied Jobs tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Edit Profile" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Preview Profile" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Applied Jobs" })).toBeVisible();
  });

  test("edit profile tab has form fields", async ({ page }) => {
    await page.getByRole("button", { name: "Edit Profile" }).click();
    await expect(page.getByPlaceholder("e.g. Priya Sharma")).toBeVisible();
    await expect(page.getByPlaceholder("+91 98765 43210")).toBeVisible();
  });

  test("applied jobs tab shows empty state", async ({ page }) => {
    await page.getByRole("button", { name: "Applied Jobs" }).click();
    await expect(page.getByText(/No applications/i)).toBeVisible();
  });
});
