import { test, expect, type Page, type APIRequestContext, type BrowserContext } from "@playwright/test";

const ADMIN_EMAIL = "admin@glowngrace.in";
const ADMIN_PASS = "admin123";

const ts = Date.now();
const roleEmail = (role: string) => `e2e-um-${role}-${ts}@glowngrace.in`;

async function signInAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

async function openUsersPage(page: Page) {
  await page.getByTestId("admin-sidebar").getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({ timeout: 30_000 });
}

function row(page: Page, text: string) {
  return page.locator("tr").filter({ hasText: text });
}

async function seedUser(request: APIRequestContext, user: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
}) {
  let res = await request.post("/api/admin/users", {
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "9999990000",
      role: user.role,
      password: user.password,
    },
  });
  if (!res.ok()) {
    res = await request.post("/api/admin/users", {
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "9999990000",
        role: user.role,
        password: user.password,
      },
    });
  }
  expect(res.ok(), `seed user ${user.email} should be accepted`).toBe(true);
}

async function deleteSeededUser(request: APIRequestContext, email: string) {
  const list = await request.get("/api/admin/users");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: string; email: string }>;
  const rowRecord = items.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!rowRecord) return;
  await request.delete(`/api/admin/users?id=${rowRecord.id}`);
}

async function attemptLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("Admin user management", () => {
  test("lists accounts across all roles and filters by role", async ({ page, request }) => {
    test.setTimeout(120_000);
    const userEmail = roleEmail("user");
    const candidateEmail = roleEmail("candidate");
    const recruiterEmail = roleEmail("recruiter");

    await seedUser(request, { name: "E2E Shopper", email: userEmail, role: "user", password: "shopper99" });
    await seedUser(request, { name: "E2E Candidate", email: candidateEmail, role: "candidate", password: "cand99" });
    await seedUser(request, { name: "E2E Recruiter", email: recruiterEmail, role: "recruiter", password: "recruit99" });

    try {
      await signInAdmin(page);
      await openUsersPage(page);

      await expect(row(page, userEmail)).toBeVisible();
      await expect(row(page, candidateEmail)).toBeVisible();
      await expect(row(page, recruiterEmail)).toBeVisible();
      await expect(row(page, `${ADMIN_EMAIL}`)).toBeVisible();

      await expect(row(page, userEmail).getByRole("img", { name: "User" })).toBeVisible();
      await expect(row(page, recruiterEmail).getByRole("img", { name: "Recruiter" })).toBeVisible();

      await page.getByTestId("user-role-filter").selectOption("recruiter");
      await expect(row(page, recruiterEmail)).toBeVisible();
      await expect(row(page, userEmail)).toHaveCount(0);
      await expect(row(page, candidateEmail)).toHaveCount(0);

      await page.getByTestId("user-role-filter").selectOption("all");
      await expect(row(page, userEmail)).toBeVisible();
    } finally {
      for (const email of [userEmail, candidateEmail, recruiterEmail]) {
        await deleteSeededUser(request, email);
      }
    }
  });

  test("suspends, reactivates, and deletes an account; suspended users are blocked", async ({ page, request, browser }) => {
    test.setTimeout(180_000);
    const email = roleEmail("suspend");
    await seedUser(request, { name: "E2E Blockable", email, role: "user", password: "secret123" });

    let ctx: BrowserContext | null = null;
    try {
      await signInAdmin(page);
      await openUsersPage(page);
      await expect(row(page, email)).toBeVisible();

      await row(page, email).getByTitle("Suspend").click();
      await expect(row(page, email).getByText("Suspended")).toBeVisible({ timeout: 30_000 });

      ctx = await browser.newContext();
      const p = await ctx.newPage();
      await attemptLogin(p, email, "secret123");
      await expect(p.locator('[data-sonner-toast]').filter({ hasText: "suspended" })).toBeVisible({ timeout: 30_000 });
      await expect(p).toHaveURL(/\/login$/);

      await row(page, email).getByTitle("Activate").click();
      await expect(row(page, email).getByText("Active")).toBeVisible({ timeout: 30_000 });

      await attemptLogin(p, email, "secret123");
      await p.waitForURL("**/shopper", { timeout: 30_000 });
    } finally {
      if (ctx) await ctx.close();
      await deleteSeededUser(request, email);
    }
  });

  test("adds a new account and resets a user password", async ({ page, request, browser }) => {
    test.setTimeout(180_000);
    const email = roleEmail("add");
    const addedName = `E2E Added ${ts}`;
    const firstPassword = "firstpass12";
    const newPassword = "newpass345";

    let ctx: BrowserContext | null = null;
    try {
      await signInAdmin(page);
      await openUsersPage(page);

      await page.getByTestId("user-add").click();
      const addForm = page.getByTestId("add-user-form");
      await expect(addForm).toBeVisible();
      await addForm.getByLabel("Full Name").fill(addedName);
      await addForm.getByLabel("Email Address", { exact: true }).fill(email);
      await addForm.getByTestId("add-user-role").selectOption("recruiter");
      await addForm.getByLabel("Password", { exact: true }).fill(firstPassword);
      await addForm.getByRole("button", { name: "Create User" }).click();

      await expect(row(page, email)).toBeVisible({ timeout: 30_000 });
      await expect(row(page, email).getByRole("img", { name: "Recruiter" })).toBeVisible();

      ctx = await browser.newContext();
      const p = await ctx.newPage();
      await attemptLogin(p, email, firstPassword);
      await p.waitForURL("**/recruiter", { timeout: 30_000 });

      await row(page, email).getByTitle("Reset Password").click();
      const resetForm = page.getByTestId("reset-password-form");
      await expect(resetForm).toBeVisible();
      await resetForm.getByLabel("New Password", { exact: true }).fill(newPassword);
      await resetForm.getByLabel("Confirm New Password", { exact: true }).fill(newPassword);
      await resetForm.getByRole("button", { name: "Save New Password" }).click();
      await expect(resetForm).toHaveCount(0, { timeout: 30_000 });

      const p2 = await ctx.newPage();
      await attemptLogin(p2, email, firstPassword);
      await expect(p2.locator('[data-sonner-toast]').filter({ hasText: "Invalid" })).toBeVisible({ timeout: 30_000 });
      await expect(p2).toHaveURL(/\/login$/);

      await attemptLogin(p2, email, newPassword);
      await p2.waitForURL("**/recruiter", { timeout: 30_000 });
    } finally {
      if (ctx) await ctx.close();
      await deleteSeededUser(request, email);
    }
  });

  test("protected admin account cannot be suspended or deleted", async ({ page, request }) => {
    test.setTimeout(120_000);
    await signInAdmin(page);
    await openUsersPage(page);

    const adminRow = row(page, ADMIN_EMAIL);
    await expect(adminRow).toBeVisible();
    await expect(adminRow.getByTestId("protected-badge")).toBeVisible();
    await expect(adminRow.getByTitle("Suspend")).toHaveCount(0);
    await expect(adminRow.getByTitle("Reset Password")).toHaveCount(0);
    await expect(adminRow.getByTitle("Delete")).toHaveCount(0);
  });
});