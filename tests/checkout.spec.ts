import { test, expect } from "@playwright/test";

async function addToCart(page: import("@playwright/test").Page) {
  await page.goto("/products/luxe-liquid-lipstick");
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");
}

test.describe("Checkout flow", () => {
  test("completes a 3-step order and reaches confirmation", async ({ page }) => {
    await addToCart(page);

    await page.goto("/checkout");
    await expect(page.getByTestId("order-summary")).toBeVisible();

    // Step 1 → Shipping & Payment
    await page.getByTestId("checkout-next").click();
    await expect(page.getByLabel("First Name")).toBeVisible();

    // Fill shipping + contact
    await page.getByLabel("First Name").fill("Priya");
    await page.getByLabel("Last Name").fill("Sharma");
    await page.getByLabel("Email Address").fill(await randomEmail());
    await page.getByLabel("Phone Number").fill("9876543210");
    await page.getByLabel("Street Address").fill("123 Hazratganj Road");
    await page.getByLabel("Locality / Area").fill("Hazratganj");
    await page.getByLabel("PIN Code").fill("226001");

    // Step 2 → Review
    await page.getByTestId("checkout-next").click();
    await expect(page.getByText("Review & Confirm")).toBeVisible();

    // Place order
    await page.getByTestId("place-order").click();

    await expect(page).toHaveURL(/\/checkout\/success\?order=/);
    await expect(page.getByTestId("order-confirmation")).toBeVisible();
    await expect(page.getByTestId("order-id")).not.toBeEmpty();
  });

  test("redirects to cart when the cart is empty", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/cart/);
  });
});

let emailCounter = 0;
async function randomEmail(): Promise<string> {
  emailCounter += 1;
  return `priya+${Date.now()}${emailCounter}@example.com`;
}
