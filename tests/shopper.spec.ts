import { test, expect } from "@playwright/test";

test.describe("Shopper profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("shopper@glowngrace.in");
    await page.getByLabel("Password").fill("shopper123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/shopper/);
  });

  test("redirects to /shopper after login", async ({ page }) => {
    await expect(page).toHaveURL(/\/shopper/);
    await expect(page.getByText("Hello,")).toBeVisible();
  });

  test("shows all 5 tabs", async ({ page }) => {
    for (const tab of ["My Profile", "My Orders", "Change Password", "My Addresses", "Contact Us"]) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("profile tab shows name and email fields", async ({ page }) => {
    await page.getByRole("button", { name: "My Profile" }).click();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
  });

  test("orders tab shows empty state when no orders", async ({ page }) => {
    await page.getByRole("button", { name: "My Orders" }).click();
    await expect(page.getByText("No orders yet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Products" })).toBeVisible();
  });

  test("password tab shows 3 fields", async ({ page }) => {
    await page.getByRole("button", { name: "Change Password" }).click();
    await expect(page.getByLabel("Current Password")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "New Password", exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm New Password")).toBeVisible();
  });

  test("address tab shows empty state and add button", async ({ page }) => {
    await page.getByRole("button", { name: "My Addresses" }).click();
    await expect(page.getByText("No addresses saved")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Address" })).toBeVisible();
  });

  test("contact tab shows contact form and info cards", async ({ page }) => {
    await page.getByRole("button", { name: "Contact Us" }).click();
    await expect(page.locator("main h2").filter({ hasText: "Contact Us" })).toBeVisible();
    await expect(page.getByPlaceholder("Priya Sharma")).toBeVisible();
    await expect(page.getByPlaceholder("Tell us more...")).toBeVisible();
  });
});

test.describe("Signup page", () => {
  test("shows 2-column layout with account type selector", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Choose your account type")).toBeVisible();
    await expect(page.getByRole("button", { name: /Browse & buy beauty/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create a profile/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Manage products/ })).toBeVisible();
  });

  test("selecting Candidate shows candidate features", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: /Create a profile/ }).click();
    await expect(page.getByText("Build your portfolio")).toBeVisible();
  });

  test("creates a new shopper account", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: /Browse & buy beauty/ }).click();
    await page.getByLabel("Full Name").fill("Test Shopper");
    await page.getByLabel("Phone Number").fill("+91 12345 67890");
    await page.getByLabel("Email Address").fill(`testshopper${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("test1234");
    await page.getByLabel("Confirm Password").fill("test1234");
    await page.getByRole("button", { name: "Create Shopper Account" }).click();
    await expect(page.getByText("Account created successfully!")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Navbar role-aware profile link", () => {
  test("shopper sees My Profile linking to /shopper", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("shopper@glowngrace.in");
    await page.getByLabel("Password").fill("shopper123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/shopper/);

    await page.getByRole("button", { name: "Account menu" }).click();
    const profileLink = page.getByRole("link", { name: "My Profile" });
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    await expect(page).toHaveURL(/\/shopper/);
  });
});
