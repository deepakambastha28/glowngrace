import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

const DEMO_EMAIL = "admin@glowngrace.in";
const DEMO_PASS = "admin123";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

function row(page: Page, text: string) {
  return page.locator("tr").filter({ hasText: text });
}

async function seedProduct(request: APIRequestContext, name: string) {
  const res = await request.post("/api/admin/products", {
    data: {
      emoji: "🧴",
      brand: "E2E Actions",
      name,
      category: "Skincare",
      price: 599,
      oldPrice: 0,
      stock: 25,
      description: "E2E actions product.",
      descriptionHtml: "",
      features: ["Verifies actions"],
      tags: ["e2e"],
      imageData: null,
      shade: "",
      size: "60ml",
      finish: "",
      ingredients: "",
      isNew: false,
    },
  });
  expect(res.ok()).toBe(true);
}

async function seedJob(request: APIRequestContext, title: string) {
  const res = await request.post("/api/admin/jobs", {
    data: {
      title,
      salon: "E2E Actions Salon",
      location: "Hazratganj",
      type: "Full Time",
      salaryMin: 18000,
      salaryMax: 25000,
      salaryText: "₹18k–25k",
      experience: "2+ years",
      openings: 2,
      description: "E2E actions job.",
      requirements: ["E2E requirement"],
      status: "Pending",
    },
  });
  expect(res.ok()).toBe(true);
}

async function seedPartner(request: APIRequestContext, name: string) {
  const res = await request.post("/api/admin/partners", {
    data: {
      slug: `e2e-actions-${Date.now()}`,
      name,
      type: "Beauty Parlour",
      loc: "Hazratganj",
      emoji: "💆",
    },
  });
  expect(res.ok()).toBe(true);
}

async function seedCandidate(request: APIRequestContext, email: string) {
  const res = await request.post("/api/candidates", {
    data: {
      userEmail: email,
      fullName: `E2E Candidate ${Date.now()}`,
      phone: "9999990000",
      email,
      city: "Lucknow",
      experience: "2+ years",
      specialization: "Skincare",
      qualification: "B.Sc",
      bio: "E2E candidate.",
      skills: ["Facial", "Waxing"],
      gallery: [],
      resumeName: null,
    },
  });
  expect(res.ok()).toBe(true);
}

async function findJobId(request: APIRequestContext, title: string) {
  const list = await request.get("/api/admin/jobs");
  const jobs = (((await list.json()) as { items: Array<{ id: number; title: string }> }).items ?? []);
  const job = jobs.find((j) => j.title === title);
  expect(job, `seeded job "${title}" should appear on /api/admin/jobs`).toBeTruthy();
  return String(job!.id);
}

test.describe("Admin record actions (edit / delete / hide / hold)", () => {
  test("products: edit, hide (off storefront), unhide, delete", async ({ page, request }) => {
    test.setTimeout(150_000);
    const original = `E2E Action Product ${Date.now()}`;
    const renamed = `E2E Action Product Renamed ${Date.now()}`;

    await seedProduct(request, original);
    await signIn(page);

    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Products" }).click();
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(original, { exact: true })).toBeVisible();

    const origRow = row(page, original);
    await origRow.getByTitle("Edit").click();
    await expect(page.getByRole("heading", { name: "Edit Product" })).toBeVisible({ timeout: 30_000 });
    const nameInput = page.getByPlaceholder("e.g. Luxe Liquid Lipstick");
    await expect(nameInput).toHaveValue(original);
    await nameInput.fill(renamed);
    await page.getByRole("button", { name: "Save Product" }).click();
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();

    await row(page, renamed).getByTitle("Hide").click();
    await expect(row(page, renamed).getByText("Hidden")).toBeVisible({ timeout: 30_000 });
    let items = (((await (await request.get("/api/products")).json()) as { items: Array<{ name: string }> }).items ?? []);
    expect(items.some((p) => p.name === renamed)).toBe(false);

    await row(page, renamed).getByTitle("Unhide").click();
    await expect(row(page, renamed).getByText("Hidden")).toHaveCount(0, { timeout: 30_000 });
    items = (((await (await request.get("/api/products")).json()) as { items: Array<{ name: string }> }).items ?? []);
    expect(items.some((p) => p.name === renamed)).toBe(true);

    page.once("dialog", (d) => d.accept());
    await row(page, renamed).getByTitle("Delete").click();
    await expect(row(page, renamed)).toHaveCount(0, { timeout: 30_000 });
  });

  test("jobs: accept (pending), hold, edit, delete", async ({ page, request }) => {
    test.setTimeout(150_000);
    const original = `E2E Action Job ${Date.now()}`;
    const renamed = `E2E Action Job Renamed ${Date.now()}`;

    await seedJob(request, original);
    await signIn(page);

    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Jobs" }).click();
    await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(original, { exact: true })).toBeVisible();
    await expect(row(page, original).getByText("Pending")).toBeVisible({ timeout: 30_000 });

    let items = (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []);
    expect(items.some((x) => x.title === original)).toBe(false);

    await row(page, original).getByTitle("View details").click();
    const modal = page.getByTestId("job-detail-modal");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await expect(modal.getByText("E2E actions job.")).toBeVisible();
    await expect(modal.getByText("Key Requirements")).toBeVisible();

    await modal.getByRole("button", { name: "Accept" }).click();
    await expect(modal).toHaveCount(0, { timeout: 10_000 });
    await expect(row(page, original).getByText("Open")).toBeVisible({ timeout: 30_000 });
    items = (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []);
    expect(items.some((x) => x.title === original)).toBe(true);

    await row(page, original).getByTitle("View details").click();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole("button", { name: "Reject" }).click();
    await expect(modal).toHaveCount(0, { timeout: 10_000 });
    await expect(row(page, original).getByText("Rejected")).toBeVisible({ timeout: 30_000 });
    items = (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []);
    expect(items.some((x) => x.title === original)).toBe(false);

    await row(page, original).getByTitle("Hold").click();
    await expect(row(page, original).getByText("On Hold")).toBeVisible({ timeout: 30_000 });
    items = (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []);
    expect(items.some((x) => x.title === original)).toBe(false);

    await row(page, original).getByTitle("Accept").click();
    await expect(row(page, original).getByText("Open")).toBeVisible({ timeout: 30_000 });

    const origRow = row(page, original);
    await origRow.getByTitle("Edit").click();
    await expect(page.getByRole("heading", { name: "Edit Job" })).toBeVisible({ timeout: 30_000 });
    const titleInput = page.getByPlaceholder("e.g. Senior Beautician");
    await expect(titleInput).toHaveValue(original);
    await titleInput.fill(renamed);
    await page.getByRole("button", { name: "Update Job" }).click();
    await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await row(page, renamed).getByTitle("Delete").click();
    await expect(row(page, renamed)).toHaveCount(0, { timeout: 30_000 });
  });

  test("jobs: approve & reject a recruiter hold request (reflects on site)", async ({ page, request }) => {
    test.setTimeout(150_000);
    const title = `E2E Hold Request ${Date.now()}`;

    await seedJob(request, title);
    const id = await findJobId(request, title);
    await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Open" } });
    await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Pending Hold" } });

    const siteTitles = async () =>
      (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []).map(
        (x) => x.title
      );
    expect((await siteTitles()).includes(title)).toBe(false);

    await signIn(page);
    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Jobs" }).click();
    await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(row(page, title).getByText("Pending Hold")).toBeVisible({ timeout: 30_000 });

    await row(page, title).getByTitle("View details").click();
    const modal = page.getByTestId("job-detail-modal");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await expect(modal.getByText(/Recruiter requested to put this job on hold/)).toBeVisible();
    await modal.getByRole("button", { name: "Approve Hold" }).click();
    await expect(modal).toHaveCount(0, { timeout: 10_000 });
    await expect(row(page, title).getByText("On Hold")).toBeVisible({ timeout: 30_000 });
    expect((await siteTitles()).includes(title)).toBe(false);

    await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Pending Hold" } });
    await page.reload();
    await expect(row(page, title).getByText("Pending Hold")).toBeVisible({ timeout: 30_000 });
    await row(page, title).getByTitle("View details").click();
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole("button", { name: "Reject Hold" }).click();
    await expect(modal).toHaveCount(0, { timeout: 10_000 });
    await expect(row(page, title).getByText("Open")).toBeVisible({ timeout: 30_000 });
    expect((await siteTitles()).includes(title)).toBe(true);

    await request.delete(`/api/admin/jobs?id=${id}`);
  });

  test("partners: edit, hold (off storefront), activate, hide, delete", async ({ page, request }) => {
    test.setTimeout(150_000);
    const original = `E2E Action Partner ${Date.now()}`;
    const renamed = `E2E Action Partner Renamed ${Date.now()}`;

    await seedPartner(request, original);
    await signIn(page);

    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Partners" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(original, { exact: true })).toBeVisible();

    const origRow = row(page, original);
    await origRow.getByTitle("Edit").click();
    await expect(page.getByRole("heading", { name: "Edit Partner" })).toBeVisible({ timeout: 30_000 });
    const nameField = page.getByLabel("Partner Name");
    await expect(nameField).toHaveValue(original);
    await nameField.fill(renamed);
    await page.getByRole("button", { name: "Save Partner" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();

    await row(page, renamed).getByTitle("Hold").click();
    await expect(row(page, renamed).getByText("On Hold")).toBeVisible({ timeout: 30_000 });
    let items = (((await (await request.get("/api/partners")).json()) as { items: Array<{ name: string }> }).items ?? []);
    expect(items.some((p) => p.name === renamed)).toBe(false);

    await row(page, renamed).getByTitle("Activate").click();
    await expect(row(page, renamed).getByText("Active")).toBeVisible({ timeout: 30_000 });
    items = (((await (await request.get("/api/partners")).json()) as { items: Array<{ name: string }> }).items ?? []);
    expect(items.some((p) => p.name === renamed)).toBe(true);

    await row(page, renamed).getByTitle("Hide").click();
    await expect(row(page, renamed).getByText("Hidden")).toBeVisible({ timeout: 30_000 });
    items = (((await (await request.get("/api/partners")).json()) as { items: Array<{ name: string }> }).items ?? []);
    expect(items.some((p) => p.name === renamed)).toBe(false);

    page.once("dialog", (d) => d.accept());
    await row(page, renamed).getByTitle("Delete").click();
    await expect(row(page, renamed)).toHaveCount(0, { timeout: 30_000 });
  });

  test("candidates: edit, hold, hide, unhide, delete", async ({ page, request }) => {
    test.setTimeout(150_000);
    const email = `e2e-actions-${Date.now()}@candidate.glowngrace.in`;

    await seedCandidate(request, email);
    await signIn(page);

    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Candidates" }).click();
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible({ timeout: 30_000 });

    const fullName = await (async () => {
      const res = await request.get(`/api/candidates?email=${email}`);
      const data = (await res.json()) as { candidate?: { fullName: string } };
      return data.candidate?.fullName ?? "";
    })();
    await expect(page.getByText(fullName, { exact: true })).toBeVisible({ timeout: 30_000 });

    const cRow = row(page, fullName);
    await cRow.getByTitle("Hold").click();
    await expect(cRow.getByText("On Hold")).toBeVisible({ timeout: 30_000 });

    await cRow.getByTitle("Activate").click();
    await expect(cRow.getByText("Active")).toBeVisible({ timeout: 30_000 });

    await cRow.getByTitle("Hide").click();
    await expect(cRow.getByText("Hidden")).toBeVisible({ timeout: 30_000 });

    await cRow.getByTitle("Unhide").click();
    await expect(cRow.getByText("Active")).toBeVisible({ timeout: 30_000 });

    await cRow.getByTitle("Edit").click();
    await expect(page.getByRole("heading", { name: "Edit Candidate" })).toBeVisible({ timeout: 30_000 });
    const cityField = page.getByLabel("City");
    await cityField.fill("Noida");
    await page.getByRole("button", { name: "Save Candidate" }).click();
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible({ timeout: 30_000 });
    await expect(row(page, fullName).getByText("Noida")).toBeVisible({ timeout: 30_000 });

    page.once("dialog", (d) => d.accept());
    await row(page, fullName).getByTitle("Delete").click();
    await expect(row(page, fullName)).toHaveCount(0, { timeout: 30_000 });
  });
});