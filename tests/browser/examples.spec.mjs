import { expect, test } from "@playwright/test";
import { analyzeAccessibility, severeViolations } from "./axe-inject.mjs";

const examples = [
  {
    path: "/examples/ja-journal-club/index.html",
    lang: "ja",
    expectedNnt: "22",
  },
  {
    path: "/examples/en-journal-club/index.html",
    lang: "en",
    expectedNnt: "22",
  },
  { path: "/examples/en-case-conference/index.html", lang: "en" },
];

test("print readiness waits for example initialization", async ({ page }) => {
  let releaseFixture;
  const fixtureGate = new Promise((resolve) => {
    releaseFixture = resolve;
  });
  await page.route(
    "**/tests/fixtures/examples/ja-journal-club.json",
    async (route) => {
      await fixtureGate;
      await route.continue();
    },
  );
  await page.goto("/examples/ja-journal-club/index.html", {
    waitUntil: "domcontentloaded",
  });
  expect(
    await page.locator("html").getAttribute("data-print-ready"),
  ).toBeNull();
  releaseFixture();
  await page.waitForFunction(
    () => document.documentElement.dataset.exampleReady === "true",
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.printReady === "true",
  );
});

for (const example of examples) {
  const name = example.path.split("/")[2];
  test(`${name} example is offline, accessible, and print-safe`, async ({
    page,
  }) => {
    const externalRequests = [];
    page.on("request", (request) => {
      if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname))
        externalRequests.push(request.url());
    });
    await page.goto(example.path, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.documentElement.dataset.exampleReady === "true",
    );
    await page.waitForFunction(
      () => document.documentElement.dataset.printReady === "true",
    );
    await expect(page.locator("html")).toHaveAttribute("lang", example.lang);
    const slides = page.locator(".slide");
    const slideCount = await slides.count();
    await expect(page.locator(".synthetic-marker")).toHaveCount(slideCount);
    await expect(page.getByText(/SOURCE NOT PROVIDED/i).first()).toBeVisible();
    if (example.expectedNnt)
      await expect(page.locator("[data-example-nnt]")).toHaveText(
        example.expectedNnt,
      );

    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
    ]) {
      await page.setViewportSize(viewport);
      const overflow = await slides.evaluateAll(
        (nodes) =>
          nodes.filter(
            (node) =>
              node.scrollWidth > node.clientWidth + 1 ||
              node.scrollHeight > node.clientHeight + 1,
          ).length,
      );
      expect(overflow).toBe(0);
    }

    expect(severeViolations(await analyzeAccessibility(page))).toEqual([]);
    const pdf = await page.pdf({
      width: "13.333333in",
      height: "7.5in",
      printBackground: true,
    });
    expect(
      (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length,
    ).toBe(slideCount);
    expect(externalRequests).toEqual([]);
  });
}
