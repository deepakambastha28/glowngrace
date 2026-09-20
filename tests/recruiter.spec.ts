import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

async function signIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill("recruiter@glowngrace.in");
  await page.getByLabel("Password").fill("recruiter123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/recruiter/);
}

async function seedCandidate(request: APIRequestContext, email: string): Promise<{ id: string; name: string }> {
  const name = `E2E Talent ${Date.now()}`;
  const res = await request.post("/api/candidates", {
    data: {
      userEmail: email,
      fullName: name,
      phone: "9999990000",
      email,
      city: "Lucknow",
      experience: "2+ years",
      specialization: "Makeup Artistry",
      qualification: "Diploma",
      bio: "E2E candidate for recruiter flow.",
      skills: ["Bridal", "HD Makeup"],
      gallery: [],
      resumeName: null,
    },
  });
  expect(res.ok()).toBe(true);

  const list = await request.get("/api/admin/candidates");
  const items = (((await list.json()) as { items: Array<{ id: string; fullName: string }> }).items ?? []);
  const row = items.find((c) => c.fullName === name);
  expect(row, `seeded candidate "${name}" should appear on /api/admin/candidates`).toBeTruthy();
  return { id: String(row!.id), name };
}

async function cleanupCandidate(request: APIRequestContext, id: string): Promise<void> {
  const list = await request.get("/api/admin/candidates");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: string; fullName: string }>;
  const row = items.find((c) => String(c.id) === id);
  if (!row) return;
  if (!/e2e/i.test(row.fullName)) {
    throw new Error(`Refused to delete non-test candidate "${row.fullName}". Only E2E test records may be deleted.`);
  }
  await request.delete(`/api/admin/candidates?id=${id}`);
}

test.describe("Recruiter portal", () => {
  test("redirects to /recruiter after login", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/recruiter/);
  });

  test("recruiter logout returns to the home page", async ({ page }) => {
    await signIn(page);
    await page.getByTestId("recruiter-topnav").getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("navbar")).toBeVisible();
  });

  test("recruiter top menu shows role links", async ({ page }) => {
    await signIn(page);
    const nav = page.getByTestId("recruiter-topnav");
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Candidates" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Careers" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Events" })).toBeVisible();
    await nav.getByRole("link", { name: "Candidates" }).click();
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible();
    await expect(page.getByText("Recruiter Portal")).toBeVisible();
  });

  test("recruiter profile shows gallery, services and packages managers", async ({ page }) => {
    await signIn(page);
    await page.goto("/recruiter/profile");
    await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("salon-gallery")).toBeVisible();
    await expect(page.getByTestId("services-section")).toBeVisible();
    await expect(page.getByTestId("packages-section")).toBeVisible();
  });

  test("recruiter can add a package via the form", async ({ page, request }) => {
    test.setTimeout(120_000);
    const name = `E2E Pkg ${Date.now()}`;
    const cleanup = async () => {
      const list = await request.get("/api/recruiters/packages?email=recruiter@glowngrace.in");
      const items = (((await list.json()) as { items: Array<{ id: string; name: string }> }).items ?? []);
      for (const p of items) {
        if (p.name === name) await request.delete(`/api/recruiters/packages?id=${p.id}&email=recruiter@glowngrace.in`);
      }
    };

    try {
      await signIn(page);
      await page.goto("/recruiter/profile");
      await expect(page.getByTestId("packages-section")).toBeVisible({ timeout: 30_000 });

      await page.getByRole("button", { name: "Facials & Skin Care", exact: true }).click();
      await page.getByTestId("package-name").fill(name);
      await page.getByTestId("package-price").fill("2999");
      await page.getByTestId("package-duration").fill("1 month");
      await page.getByTestId("add-package").click();

      await expect(page.getByTestId("package-row").filter({ hasText: name })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("package-row").filter({ hasText: "₹2,999" })).toBeVisible();
    } finally {
      await cleanup();
    }
  });

  test("recruiter can bulk import packages from a JSON file", async ({ page, request }) => {
    test.setTimeout(120_000);
    const name = `E2E Import Pkg ${Date.now()}`;
    const cleanup = async () => {
      const list = await request.get("/api/recruiters/packages?email=recruiter@glowngrace.in");
      const items = (((await list.json()) as { items: Array<{ id: string; name: string }> }).items ?? []);
      for (const p of items) {
        if (p.name === name) await request.delete(`/api/recruiters/packages?id=${p.id}&email=recruiter@glowngrace.in`);
      }
    };

    try {
      await signIn(page);
      await page.goto("/recruiter/profile");
      await expect(page.getByTestId("packages-section")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("packages-file").setInputFiles({
        name: "packages.json",
        mimeType: "application/json",
        buffer: Buffer.from(
          JSON.stringify([
            {
              name,
              price: 1999,
              duration: "1 session",
              description: "Imported via file upload",
              services: ["Haircut & Styling"],
            },
          ])
        ),
      });

      await expect(page.getByTestId("package-row").filter({ hasText: name })).toBeVisible({ timeout: 30_000 });
    } finally {
      await cleanup();
    }
  });

  test("recruiter can create an event", async ({ page, request }) => {
    test.setTimeout(150_000);
    const title = `E2E Recruiter Event ${Date.now()}`;

    const cleanup = async () => {
      const res = await request.get("/api/admin/events");
      const events = (((await res.json()) as { items: Array<{ id: string; title: string }> }).items ?? []);
      const row = events.find((e) => e.title === title);
      if (row) await request.delete(`/api/admin/events?id=${row.id}`);
    };

    try {
      await signIn(page);
      await page.getByTestId("recruiter-topnav").getByRole("link", { name: "Events" }).click();
      await expect(page.getByRole("heading", { name: "Events" })).toBeVisible({ timeout: 30_000 });
      await page.getByRole("button", { name: "Create Event" }).first().click();
      await expect(page.getByRole("heading", { name: /Add New Event/ })).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("event-title-input").fill(title);
      await page.getByTestId("event-date-input").fill("2027-05-10");
      await page.getByRole("button", { name: "Save Event" }).click();

      await expect(page.getByRole("heading", { name: "Events" })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 30_000 });
    } finally {
      await cleanup();
    }
  });

  test("lists candidates and supports hire flow", async ({ page, request }) => {
    test.setTimeout(150_000);
    const email = `e2e-recruit-${Date.now()}@talent.glowngrace.in`;
    const seeded = await seedCandidate(request, email);

    try {
      await signIn(page);
      await page.getByTestId("recruiter-topnav").getByRole("link", { name: "Candidates" }).click();
      await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/active candidate/)).toBeVisible({ timeout: 30_000 });

      const hireButton = page.getByRole("button", { name: `Hire ${seeded.name.split(" ")[0]}` });
      for (let i = 0; i < 20; i++) {
        if (await hireButton.isVisible()) break;
        await page.reload();
        await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible({ timeout: 15_000 });
      }
      await expect(hireButton).toBeVisible({ timeout: 30_000 });

      const hire = await request.post("/api/recruiters/hire", {
        data: {
          candidateId: Number(seeded.id),
          recruiterEmail: "recruiter@glowngrace.in",
          candidateName: seeded.name,
          candidateEmail: email,
        },
      });
      expect(hire.ok()).toBe(true);
      const hiredBody = (await hire.json()) as { hired?: boolean; id?: number };
      expect(hiredBody.hired).toBe(true);

      const after = await request.get(`/api/admin/candidates?id=${seeded.id}`);
      const item = ((await after.json()) as { item: { status: string } | null }).item;
      expect(item?.status).toBe("Hired");
    } finally {
      await cleanupCandidate(request, seeded.id);
    }
  });

  test("jobs page lists live openings", async ({ page, request }) => {
    test.setTimeout(150_000);
    const title = `E2E Recruiter Job ${Date.now()}`;
    const res = await request.post("/api/admin/jobs", {
      data: {
        title,
        salon: "E2E Salon",
        location: "Lucknow",
        type: "Full Time",
        salaryMin: 10000,
        salaryMax: 15000,
        salaryText: "₹10k–15k",
        experience: "1-2 years",
        openings: 2,
        description: "E2E job for recruiter jobs page.",
        requirements: ["Teamwork"],
      },
    });
    expect(res.ok()).toBe(true);

    try {
      await signIn(page);
      await page.goto("/recruiter/jobs");
      await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 30_000 });
    } finally {
      const list = await request.get("/api/admin/jobs");
      const jobs = (((await list.json()) as { items: Array<{ id: number; title: string }> }).items ?? []);
      const job = jobs.find((j) => j.title === title);
      if (job) await request.delete(`/api/admin/jobs?id=${job.id}`);
    }
  });

  test("recruiter edit resubmits (Pending) and hold request reflects on site after admin decision", async ({ page, request }) => {
    test.setTimeout(180_000);
    const title = `E2E Job Flow ${Date.now()}`;
    const renamed = `E2E Job Flow Renamed ${Date.now()}`;

    const res = await request.post("/api/admin/jobs", {
      data: {
        title,
        salon: "E2E Salon",
        location: "Lucknow",
        type: "Full Time",
        salaryMin: 10000,
        salaryMax: 15000,
        salaryText: "₹10k–15k",
        experience: "1-2 years",
        openings: 2,
        description: "E2E job for recruiter edit + hold flow.",
        requirements: ["Teamwork"],
      },
    });
    expect(res.ok()).toBe(true);

    const id = await (async () => {
      const list = await request.get("/api/admin/jobs");
      const jobs = (((await list.json()) as { items: Array<{ id: number; title: string }> }).items ?? []);
      const job = jobs.find((j) => j.title === title);
      expect(job).toBeTruthy();
      return String(job!.id);
    })();

    const siteJobs = async () =>
      (((await (await request.get("/api/jobs")).json()) as { items: Array<{ title: string }> }).items ?? []).map(
        (x) => x.title
      );
    const adminJob = async () =>
      (((await (await request.get(`/api/admin/jobs?id=${id}`)).json()) as {
        item: { title: string; status: string } | null;
      }).item);

    try {
      await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Open" } });
      expect((await siteJobs()).includes(title)).toBe(true);

      await signIn(page);
      await page.goto("/recruiter/jobs");
      await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });

      const card = page.locator(".card", { hasText: title });
      await expect(card.getByRole("button", { name: "Edit" })).toBeVisible({ timeout: 30_000 });
      await card.getByRole("button", { name: "Edit" }).click();
      await expect(page.getByRole("heading", { name: "Edit Job" })).toBeVisible({ timeout: 30_000 });
      const titleInput = page.getByPlaceholder("e.g. Senior Beautician");
      await expect(titleInput).toHaveValue(title);
      await titleInput.fill(renamed);
      await page.getByRole("button", { name: "Update Job" }).click();
      await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible({ timeout: 30_000 });

      let job = await adminJob();
      expect(job?.title).toBe(renamed);
      expect(job?.status).toBe("Pending");
      expect((await siteJobs()).includes(renamed)).toBe(false);

      await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Open" } });
      expect((await siteJobs()).includes(renamed)).toBe(true);

      await page.reload();
      const card2 = page.locator(".card", { hasText: renamed });
      await expect(card2.getByRole("button", { name: "Hold" })).toBeVisible({ timeout: 30_000 });
      page.once("dialog", (d) => d.accept());
      await card2.getByRole("button", { name: "Hold" }).click();
      await expect(page.getByText("Pending Hold")).toBeVisible({ timeout: 30_000 });
      job = await adminJob();
      expect(job?.status).toBe("Pending Hold");
      expect((await siteJobs()).includes(renamed)).toBe(false);

      await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "On Hold" } });
      job = await adminJob();
      expect(job?.status).toBe("On Hold");
      expect((await siteJobs()).includes(renamed)).toBe(false);

      await request.patch(`/api/admin/jobs?id=${id}`, { data: { status: "Open" } });
      expect((await siteJobs()).includes(renamed)).toBe(true);
    } finally {
      await request.delete(`/api/admin/jobs?id=${id}`);
    }
  });
});