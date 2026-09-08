import { test, expect } from "@playwright/test";

test.describe("Events", () => {
  test("lists event tiles with a count", async ({ page }) => {
    await page.goto("/events");

    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    const tiles = page.getByTestId("event-tile");
    await expect(tiles.first()).toBeVisible();
    await expect(tiles).toHaveCount(8);
    await expect(page.getByTestId("event-count")).toContainText("8");
  });

  test("filters events by date (month)", async ({ page }) => {
    await page.goto("/events");

    await page.getByTestId("event-date-filter").selectOption({ label: "Sep 2026" });

    const tiles = page.getByTestId("event-tile");
    await expect(tiles).toHaveCount(1);
    await expect(tiles.first()).toContainText("Festive Makeup Masterclass");
    await expect(
      tiles.first().getByTestId("event-date")
    ).toContainText("Sep 2026");
  });

  test("filters events by location", async ({ page }) => {
    await page.goto("/events");

    await page.getByTestId("event-loc-filter").selectOption({ label: "Gomti Nagar" });

    const tiles = page.getByTestId("event-tile");
    await expect(tiles).toHaveCount(2);
    for (const tile of await tiles.all()) {
      await expect(tile.getByTestId("event-loc")).toContainText("Gomti Nagar");
    }
  });

  test("clearing filters restores the full list", async ({ page }) => {
    await page.goto("/events");

    await page.getByTestId("event-date-filter").selectOption({ label: "Oct 2026" });
    await page.getByTestId("event-loc-filter").selectOption({ label: "Hazratganj" });
    await expect(page.getByTestId("event-tile")).toHaveCount(1);

    await page.getByTestId("event-clear").click();

    await expect(page.getByTestId("event-tile")).toHaveCount(8);
    await expect(page.getByTestId("event-count")).toContainText("8");
  });

  test("opens an event from the tile and shows details + gallery", async ({ page }) => {
    await page.goto("/events");

    await page
      .getByTestId("event-tile")
      .filter({ hasText: "Bridal Glow Workshop" })
      .click();

    await expect(page).toHaveURL(/\/events\/bridal-glow-workshop/);
    await expect(
      page.getByRole("heading", { name: "Bridal Glow Workshop" })
    ).toBeVisible();

    const galleryItems = page.getByTestId("event-gallery").getByTestId("event-photo");
    await expect(galleryItems.first()).toBeVisible();

    await galleryItems.first().click();
    await expect(page.getByTestId("event-lightbox")).toBeVisible();
    await page.getByRole("button", { name: "✕" }).click();
    await expect(page.getByTestId("event-lightbox")).not.toBeVisible();
  });

  test("shows an Events link in the navbar", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Events" }).click();

    await expect(page).toHaveURL(/\/events/);
  });
});