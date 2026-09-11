import { test, expect } from "@playwright/test";
import { seedEvent, deleteSeededEvent } from "./helpers";

const EVENT_FIXTURES = [
  {
    title: "Festive Makeup Masterclass",
    category: "Workshop",
    emoji: "💄",
    gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)",
    date: "2026-09-12",
    time: "11:00 AM",
    loc: "Hazratganj",
    venue: "Bara Imambara Courtyard",
    price: "Free",
    capacity: 60,
    spotsLeft: 42,
    description: "Step-by-step festive makeup masterclass for the season.",
    agenda: ["Welcome & introductions", "Festive look demo", "Q&A with artists"],
    tags: ["Makeup", "Festive"],
  },
  {
    title: "Bridal Glow Workshop",
    category: "Workshop",
    emoji: "💍",
    gradient: "linear-gradient(135deg,#8e44ad,#f5c6e5)",
    date: "2026-10-05",
    time: "1:00 PM",
    loc: "Gomti Nagar",
    venue: "Aurelia Salon & Spa",
    price: "₹499",
    capacity: 40,
    spotsLeft: 12,
    description: "Bridal prep, skincare and makeup secrets.",
    agenda: ["Bridal skincare", "Makeup trial", "Mehndi pairing"],
    tags: ["Bridal", "Makeup"],
  },
  {
    title: "Kartik Purnima Meetup",
    category: "Meetup",
    emoji: "🪔",
    gradient: "linear-gradient(135deg,#e67e22,#f9d493)",
    date: "2026-10-12",
    time: "6:30 PM",
    loc: "Hazratganj",
    venue: "Rosette Lounge",
    price: "Free",
    capacity: 80,
    spotsLeft: 80,
    description: "A festive evening for beauty professionals.",
    agenda: ["Networking", "Light refreshments"],
    tags: ["Meetup", "Festive"],
  },
  {
    title: "Spa & Salon Expo",
    category: "Meetup",
    emoji: "💆",
    gradient: "linear-gradient(135deg,#16a085,#a8e6cf)",
    date: "2026-11-08",
    time: "10:00 AM",
    loc: "Gomti Nagar",
    venue: "Expo Pavilion",
    price: "₹199",
    capacity: 120,
    spotsLeft: 77,
    description: "Demo stalls and supplier meetup.",
    agenda: ["Vendor stalls", "Live demos"],
    tags: ["Expo", "Business"],
  },
  {
    title: "Winter Glow Launch",
    category: "Launch",
    emoji: "❄️",
    gradient: "linear-gradient(135deg,#2c3e50,#8fb5d9)",
    date: "2026-12-11",
    time: "5:00 PM",
    loc: "Aliganj",
    venue: "Glow & Grace Studio",
    price: "Free",
    capacity: 50,
    spotsLeft: 28,
    description: "Unveiling the winter skincare range.",
    agenda: ["Product reveal", "Winter routine demo"],
    tags: ["Launch", "Skincare"],
  },
  {
    title: "Christmas Party Class",
    category: "Masterclass",
    emoji: "🎄",
    gradient: "linear-gradient(135deg,#c0392b,#f7a8a0)",
    date: "2026-12-19",
    time: "4:00 PM",
    loc: "Naka Hindola",
    venue: "The Velvet Room",
    price: "₹349",
    capacity: 30,
    spotsLeft: 5,
    description: "Festive party looks for the holidays.",
    agenda: ["Party eye looks", "Long-wear tips"],
    tags: ["Party", "Makeup"],
  },
  {
    title: "New Year Makeup Masterclass",
    category: "Masterclass",
    emoji: "🥂",
    gradient: "linear-gradient(135deg,#7d3c98,#e5b8f5)",
    date: "2027-01-09",
    time: "11:00 AM",
    loc: "Hazratganj",
    venue: "Bara Imambara Courtyard",
    price: "Free",
    capacity: 60,
    spotsLeft: 60,
    description: "Ring in the new year with a fresh beauty routine.",
    agenda: ["Trend forecasting", "Live demo"],
    tags: ["New Year", "Makeup"],
  },
  {
    title: "Holi Beauty Bash",
    category: "Workshop",
    emoji: "🎨",
    gradient: "linear-gradient(135deg,#e84343,#fbd0b0)",
    date: "2027-02-13",
    time: "9:30 AM",
    loc: "Kapoorthala",
    venue: "Rang Mahal Salon",
    price: "₹199",
    capacity: 45,
    spotsLeft: 18,
    description: "Safe, vibrant Holi looks class.",
    agenda: ["Colour-safe skincare", "Holi makeup looks"],
    tags: ["Holi", "Workshop"],
  },
];

test.describe("Events", () => {
  const seededSlugs: string[] = [];

  test.beforeAll(async ({ request }) => {
    const adminList = await request.get("/api/admin/events");
    if (adminList.ok()) {
      const items = ((await adminList.json()).items ?? []) as Array<{ id: number }>;
      for (const item of items) {
        await request.delete(`/api/admin/events?id=${item.id}`);
      }
    }
    for (const fixture of EVENT_FIXTURES) {
      const slug = await seedEvent(request, fixture);
      seededSlugs.push(slug);
    }
  });

  test.afterAll(async ({ request }) => {
    for (const slug of seededSlugs) {
      await deleteSeededEvent(request, slug);
    }
  });

  test("lists event tiles with a count", async ({ page }) => {
    await page.goto("/events");

    await expect(page.getByRole("heading", { name: "Events", exact: true })).toBeVisible();
    const tiles = page.getByTestId("event-tile");
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

  test("opens an event from the tile and shows details", async ({ page }) => {
    await page.goto("/events");

    await page
      .getByTestId("event-tile")
      .filter({ hasText: "Bridal Glow Workshop" })
      .click();

    await expect(page).toHaveURL(/\/events\/bridal-glow-workshop/);
    await expect(
      page.getByRole("heading", { name: "Bridal Glow Workshop" })
    ).toBeVisible();
    await expect(page.getByText("Gomti Nagar, Lucknow")).toBeVisible();
    await expect(page.getByText("Bridal skincare")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Book My Seat/ })
    ).toBeVisible();
  });

  test("shows an Events link in the navbar", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Events" }).click();

    await expect(page).toHaveURL(/\/events/);
  });

  test.describe("Carousel banner", () => {
    test("renders after the breadcrumb and navigates slides", async ({ page }) => {
      await page.goto("/events");

      await page.getByTestId("event-carousel").hover();
      await expect(page.getByTestId("event-slide")).toHaveCount(4);
      await expect(
        page.getByTestId("event-slide").first()
      ).toHaveAttribute("data-active", "true");

      await page.getByTestId("event-carousel-next").click();
      await expect(
        page.getByTestId("event-slide").nth(1)
      ).toHaveAttribute("data-active", "true");
      await expect(
        page.getByTestId("event-slide").first()
      ).toHaveAttribute("data-active", "false");

      await page.getByTestId("event-carousel-prev").click();
      await expect(
        page.getByTestId("event-slide").first()
      ).toHaveAttribute("data-active", "true");

      await page.getByTestId("event-carousel-dot").nth(3).click();
      await expect(
        page.getByTestId("event-slide").nth(3)
      ).toHaveAttribute("data-active", "true");
    });

    test("opens the featured event from a slide", async ({ page }) => {
      await page.goto("/events");

      await page.getByTestId("event-carousel").hover();
      await page.getByTestId("event-slide").first().click();

      await expect(page).toHaveURL(/\/events\/festive-makeup-masterclass/);
    });
  });
});