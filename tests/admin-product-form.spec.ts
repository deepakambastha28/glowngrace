import { test, expect, type Page } from "@playwright/test";
import { deleteSeededProduct } from "./helpers";

const DEMO_EMAIL = "admin@glowngrace.in";
const DEMO_PASS = "admin123";

const IMG_1 = "data:image/png;base64,AAAA1";
const IMG_2 = "data:image/png;base64,BBBB2";
const IMG_3 = "data:image/png;base64,CCCC3";

async function signInAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("Admin product form", () => {
  const cleanedSlugs: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const slug of cleanedSlugs.splice(0)) {
      await deleteSeededProduct(request, slug);
    }
  });

  test("multiple images persist as a gallery, imageData is the first", async ({
    request,
  }) => {
    const name = `E2E Gallery ${Date.now()}`;

    const create = await request.post("/api/admin/products", {
      data: {
        emoji: "🛡️",
        brand: "E2E Gallery",
        name,
        category: "Skincare",
        price: 499,
        oldPrice: 0,
        stock: 10,
        description: "Gallery test",
        descriptionHtml: "",
        features: ["Gallery"],
        tags: ["e2e"],
        gallery: [IMG_1, IMG_2, IMG_3],
        shade: "",
        size: "50ml",
        finish: "",
        ingredients: "",
        isNew: false,
      },
    });
    expect(create.ok()).toBe(true);

    const adminList = await request.get("/api/admin/products");
    const adminItems = ((await adminList.json()).items ?? []) as Array<{
      name: string;
      slug: string;
      gallery: string[];
      imageData: string | null;
    }>;
    const adminProduct = adminItems.find((p) => p.name === name);
    expect(adminProduct).toBeTruthy();
    expect(adminProduct?.gallery).toEqual([IMG_1, IMG_2, IMG_3]);
    expect(adminProduct?.imageData).toBe(IMG_1);
    cleanedSlugs.push(adminProduct!.slug);

    const list = await request.get("/api/products");
    const items = ((await list.json()).items ?? []) as Array<{
      name: string;
      slug: string;
      gallery: string[];
      imageData: string | null;
    }>;
    const product = items.find((p) => p.name === name);
    expect(product).toBeTruthy();
    expect(product?.gallery).toEqual([IMG_1, IMG_2, IMG_3]);
    expect(product?.imageData).toBe(IMG_1);
  });

  test("category accepts any free text and reaches the storefront", async ({
    request,
  }) => {
    const name = `E2E Category ${Date.now()}`;
    const category = "Bath & Body";

    const create = await request.post("/api/admin/products", {
      data: {
        emoji: "🛁",
        brand: "E2E Category",
        name,
        category,
        price: 349,
        oldPrice: 0,
        stock: 8,
        description: "Free text category test",
        descriptionHtml: "",
        features: ["Category"],
        tags: ["e2e"],
        gallery: [],
        shade: "",
        size: "200ml",
        finish: "",
        ingredients: "",
        isNew: false,
      },
    });
    expect(create.ok()).toBe(true);

    const list = await request.get("/api/products");
    const items = ((await list.json()).items ?? []) as Array<{
      name: string;
      slug: string;
      category: string;
    }>;
    const product = items.find((p) => p.name === name);
    expect(product).toBeTruthy();
    expect(product?.category).toBe(category);
    cleanedSlugs.push(product!.slug);
  });

  test("new product form shows a description editor, free-text category and multi-image upload", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/products/new");

    await expect(page.getByRole("heading", { name: "Add New Product" })).toBeVisible();

    const desc = page.locator("#rte-area");
    await expect(desc).toBeVisible();
    await desc.fill("Luxury formula with vitamin E.");
    await expect(desc).toContainText("vitamin E");

    const category = page.locator("#product-category");
    await expect(category).toBeVisible();
    await category.fill("Bath & Body");

    await expect(page.locator('input[type="file"][multiple]')).toBeAttached();
  });
});