import { test, expect } from "@playwright/test";
import { seedJob, deleteSeededJob } from "./helpers";

const JOB_FIXTURES = [
  {
    title: "Senior Beautician",
    salon: "Aurelia Salon & Spa",
    location: "Hazratganj",
    type: "Full Time",
    salaryMin: 24000,
    salaryMax: 32000,
    salaryText: "₹24k–32k",
    experience: "2+ years",
    openings: 3,
    description: "Lead bridal and skin services at our Hazratganj flagship.",
    requirements: ["2+ years salon experience", "Bridal service expertise"],
  },
  {
    title: "Makeup Artist",
    salon: "Velvet Touch Studio",
    location: "Gomti Nagar",
    type: "Full Time",
    salaryMin: 18000,
    salaryMax: 26000,
    salaryText: "₹18k–26k",
    experience: "1-2 years",
    openings: 2,
    description: "On-location and studio makeup for events and shoots.",
    requirements: ["Makeup portfolio", "Strong hygiene habits"],
  },
  {
    title: "Hair Stylist",
    salon: "Glam Haus",
    location: "Aliganj",
    type: "Part Time",
    salaryMin: 12000,
    salaryMax: 18000,
    salaryText: "₹12k–18k",
    experience: "1-2 years",
    openings: 2,
    description: "Expert styling, cuts and treatments on select days.",
    requirements: ["3+ years of styling"],
  },
  {
    title: "Nail Technician",
    salon: "Polished Parlour",
    location: "Hazratganj",
    type: "Full Time",
    salaryMin: 15000,
    salaryMax: 20000,
    salaryText: "₹15k–20k",
    experience: "Fresher",
    openings: 1,
    description: "Nail art, gel and spa services for walk-ins.",
    requirements: ["Eye for detail"],
  },
];

test.describe("Careers", () => {
  const seededSlugs: string[] = [];
  let seniorSlug = "";

  test.beforeAll(async ({ request }) => {
    for (const fixture of JOB_FIXTURES) {
      const slug = await seedJob(request, fixture);
      seededSlugs.push(slug);
      if (fixture.title === "Senior Beautician") seniorSlug = slug;
    }
  });

  test.afterAll(async ({ request }) => {
    for (const slug of seededSlugs) {
      await deleteSeededJob(request, slug);
    }
  });

  test("lists job vacancies", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByTestId("job-grid")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Senior Beautician/ }).first()
    ).toBeVisible();
    expect(await page.getByRole("link", { name: /Apply Now/ }).count()).toBeGreaterThanOrEqual(4);
  });

  test("submits a full application", async ({ page }) => {
    expect(seniorSlug).toBeTruthy();
    await page.goto(`/careers/${seniorSlug}/apply`);

    await page.getByLabel("Full Name").fill("Priya Sharma");
    await page.getByLabel("Phone Number").fill("9876543210");
    await page.getByLabel("Email Address").fill(`candidate+${Date.now()}@example.com`);
    await page.getByLabel("City").fill("Lucknow");

    await page.getByText("Select experience").click();
    await page.getByRole("option", { name: "2-3 years" }).click();

    await page.getByText("Select specialization").click();
    await page.getByRole("option", { name: "Beauty & Skincare" }).click();

    await page.getByText("Select qualification").click();
    await page.getByRole("option", { name: "Diploma in Cosmetology" }).click();

    await page
      .getByPlaceholder(/why you're perfect/i)
      .fill("I have three years of salon experience and love helping women look and feel their best.");

    await page.getByTestId("resume-input").setInputFiles({
      name: "resume.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });

    await page.getByRole("checkbox").check();
    await page.getByTestId("submit-application").click();

    await expect(page).toHaveURL(/apply\?success=1/);
    await expect(page.getByText(/Application\s+Submitted!/i)).toBeVisible();
  });
});