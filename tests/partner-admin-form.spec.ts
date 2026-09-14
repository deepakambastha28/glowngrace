import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "admin@glowngrace.in";
const DEMO_PASS = "admin123";

const TINY_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const TINY_PNG_B64 = `data:image/png;base64,${TINY_PNG}`;

async function signInAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

async function deletePartnerByName(
  request: import("@playwright/test").APIRequestContext,
  name: string
) {
  const list = await request.get("/api/admin/partners");
  if (!list.ok()) return;
  const rows = ((await list.json()).items ?? []) as Array<{ id: number; name: string }>;
  const row = rows.find((p) => p.name === name);
  if (row) {
    if (!/e2e/i.test(row.name)) {
      throw new Error(`Refused to delete non-test partner "${row.name}". Only E2E test records may be deleted.`);
    }
    await request.delete(`/api/admin/partners?id=${row.id}`);
  }
}

test.describe("Admin partner form mirrors recruiter profile (2-col + gallery/services/packages)", () => {
  test("admin add-partner form exposes the same sections as the recruiter profile (2-col, upload, chips, packages)", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await signInAsAdmin(page);
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Partners" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: "Add Partner" }).click();
    await expect(page.getByRole("heading", { name: "Add New Partner" })).toBeVisible({ timeout: 30_000 });

    const twoColGrid = page.locator('form .grid[class*="lg:grid-cols-["]').filter({
      has: page.locator('[data-testid="salon-gallery"]'),
    });
    await expect(twoColGrid).toHaveCount(1);
    const cols = await twoColGrid.first().evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;
    });
    expect(cols).toBe(2);

    await expect(page.getByRole("heading", { name: "Salon Gallery" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Services Provided" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Packages" })).toBeVisible();
    await expect(page.locator('[data-testid="gallery-input"]')).toBeAttached();
    await expect(page.locator('[data-testid="packages-file"]')).toBeAttached();
  });

  test("creating a partner via the admin form persists gallery, services and packages, and shows them on the storefront detail page", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const partnerName = `E2E Gallery Partner ${Date.now()}`;

    await signInAsAdmin(page);
    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Partners" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: "Add Partner" }).click();
    await expect(page.getByRole("heading", { name: "Add New Partner" })).toBeVisible({ timeout: 30_000 });

    await page.getByLabel("Partner Name").fill(partnerName);
    await page.getByLabel("Locality / Area").fill("Hazratganj");
    await page.getByLabel("Salon Type").fill("Premium Unisex Salon");

    await page.getByTestId("cover-input").setInputFiles({
      name: "cover.png",
      mimeType: "image/png",
      buffer: Buffer.from(TINY_PNG, "base64"),
    });
    await expect(
      page.locator('div:has(> label:has-text("Tile / Cover Image")) img')
    ).toHaveCount(1);

    await page.getByTestId("gallery-input").setInputFiles({
      name: "p1.png",
      mimeType: "image/png",
      buffer: Buffer.from(TINY_PNG, "base64"),
    });
    await expect(page.locator('[data-testid="salon-gallery"] img')).toHaveCount(1);

    const servicesSection = page.getByTestId("services-section");
    await servicesSection.getByRole("button", { name: "Facials & Skin Care", exact: true }).click();
    await expect(servicesSection.getByRole("button", { name: "Facials & Skin Care", exact: true })).toHaveClass(/border-emerald/);

    await page.getByTestId("package-name").fill("Signature Facial Combo");
    await page.getByTestId("package-price").fill("2499");
    await page.getByTestId("package-duration").fill("45 mins");
    await page.getByTestId("package-description").fill("Cleanse, steam and brightening mask.");
    await page.getByTestId("add-package").click();
    await expect(page.getByTestId("package-row")).toContainText("Signature Facial Combo");

    await page.getByRole("button", { name: "Save Partner" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(partnerName, { exact: true })).toBeVisible();

    const list = await request.get("/api/admin/partners");
    const rows = ((await list.json()).items ?? []) as Array<{
      id: number;
      name: string;
      gallery: string[];
      tags: string[];
      menu: unknown[];
    }>;
    const row = rows.find((p) => p.name === partnerName);
    expect(row, `seeded partner "${partnerName}" should exist`).toBeTruthy();
    expect(row!.gallery).toHaveLength(2);
    expect(row!.tags).toContain("Facials & Skin Care");
    expect(row!.menu).toHaveLength(1);

    await page.goto("/partners");
    const card = page.getByTestId(`partner-card-admin-${row!.id}`);
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card.locator(".partner-photo img")).toHaveCount(1);
    await card.getByText("View Gallery →").click();
    await expect(page.getByRole("heading", { name: partnerName })).toBeVisible({ timeout: 30_000 });

    await expect(page.locator(".banner-slider .bslide")).toHaveCount(2);
    await expect(page.locator(".gallery-grid img")).toHaveCount(2);
    await expect(page.locator(".pstat").filter({ hasText: "Photos" })).toContainText("2");
    await expect(page.getByText("Signature Facial Combo")).toBeVisible();
    await expect(page.getByText("₹2,499")).toBeVisible();

    await deletePartnerByName(request, partnerName);
  });

  test("admin edit page reloads gallery, services and packages from the persisted record", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const partnerName = `E2E Edit Roundtrip ${Date.now()}`;
    const create = await request.post("/api/admin/partners", {
      data: {
        name: partnerName,
        type: "Beauty Parlour",
        loc: "Aliganj",
        emoji: "💄",
        rating: "4.2",
        reviews: "6",
        estd: "2021",
        staff: "3",
        services: "2",
        description: "Roundtrip test",
        tags: ["Bridal Makeup", "Hair Colour"],
        gallery: [TINY_PNG_B64],
        menu: [{ name: "Bridal Plus", price: 11000, duration: "Full day", description: "", services: [] }],
      },
    });
    expect(create.ok()).toBe(true);
    const list = await request.get("/api/admin/partners");
    const rows = ((await list.json()).items ?? []) as Array<{ id: number; name: string }>;
    const row = rows.find((p) => p.name === partnerName);
    expect(row).toBeTruthy();

    await signInAsAdmin(page);
    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Partners" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await page.goto(`/admin/partners/${row!.id}/edit`);
    await expect(page.getByRole("heading", { name: "Edit Partner" })).toBeVisible({ timeout: 30_000 });

    await expect(page.getByLabel("Partner Name")).toHaveValue(partnerName);
    await expect(page.locator('div:has(> label:has-text("Tile / Cover Image")) img')).toHaveCount(1);
    const servicesSection = page.getByTestId("services-section");
    await expect(servicesSection.getByRole("button", { name: "Bridal Makeup", exact: true })).toHaveClass(/border-emerald/);
    await expect(page.getByTestId("package-row")).toContainText("Bridal Plus");
    await expect(page.getByTestId("package-row")).toContainText("₹11,000");

    await deletePartnerByName(request, partnerName);
  });
});