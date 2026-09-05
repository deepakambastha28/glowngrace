import { test, expect } from "@playwright/test";

test.describe("Careers", () => {
  test("lists job vacancies", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByTestId("job-grid")).toBeVisible();
    await expect(page.getByRole("link", { name: /Apply Now/ }).first()).toBeVisible();
    expect(await page.getByRole("link", { name: /Apply Now/ }).count()).toBeGreaterThanOrEqual(4);
  });

  test("submits a full application", async ({ page }) => {
    await page.goto("/careers/senior-beautician/apply");

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
