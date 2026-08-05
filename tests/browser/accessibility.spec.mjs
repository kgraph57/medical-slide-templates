import { expect, test } from "@playwright/test";
import { analyzeAccessibility, severeViolations } from "./axe-inject.mjs";

test("catalog exposes slide semantics and no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/decks/medical-template-catalog/index.html", {
    waitUntil: "networkidle",
  });
  const slides = page.locator(".slide");
  await expect(slides.first()).toHaveAttribute("role", "region");
  await expect(slides.first()).toHaveAttribute("aria-current", "page");
  await expect(slides.nth(1)).toHaveAttribute("inert", "");
  await page.keyboard.press("End");
  await expect(slides.last()).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveURL(/#slide-\d+$/);
  await page.keyboard.press("Home");
  await expect(slides.first()).toHaveAttribute("aria-current", "page");

  const results = await analyzeAccessibility(page);
  expect(severeViolations(results)).toEqual([]);
});

test("projected narrative and dense data respect documented type floors", async ({
  page,
}) => {
  await page.goto("/decks/medical-template-catalog/index.html", {
    waitUntil: "networkidle",
  });
  const sizes = await page.locator(".slide").evaluateAll((slides) => {
    slides.forEach((slide) => {
      slide.style.display = "flex";
    });
    const narrative = [
      ...document.querySelectorAll(".slide p:not(.source-note)"),
    ]
      .filter((element) => element.textContent.trim())
      .map((element) => parseFloat(getComputedStyle(element).fontSize));
    const dense = [
      ...document.querySelectorAll(
        ".slide table th, .slide table td, .slide h4, .slide .participant-flow-box, .slide .flow-phase, .slide .review-flow-box, .slide .bib-journal, .slide .bib-meta-item, .slide .bib-meta-label, .slide .review-state",
      ),
    ]
      .filter((element) => element.textContent.trim())
      .map((element) => parseFloat(getComputedStyle(element).fontSize));
    return { narrative, dense };
  });
  expect(Math.min(...sizes.narrative)).toBeGreaterThanOrEqual(18);
  expect(Math.min(...sizes.dense)).toBeGreaterThanOrEqual(18);
});

test("all visible meaningful leaf text respects the 18px projection floor", async ({
  page,
}) => {
  await page.goto("/decks/medical-template-catalog/index.html", {
    waitUntil: "networkidle",
  });
  const offenders = await page.locator(".slide").evaluateAll((slides) => {
    slides.forEach((slide) => {
      slide.style.display = "flex";
    });
    const excluded =
      ".synthetic-marker, .slide-footer, .template-label, .source-note, .slide-page-num, .sr-only, .flow-arrow, .flow-v-arrow, .arrow, .flow-side-connector, .flow-down-connector, .review-flow-connector, svg title, svg desc";
    return [...document.querySelectorAll(".slide *")].flatMap((element) => {
      if (element.closest(excluded)) return [];
      const directText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .join(" ");
      if (!directText || !element.getClientRects().length) return [];
      const size = parseFloat(getComputedStyle(element).fontSize);
      return size < 18
        ? [
            {
              tag: element.tagName,
              className: String(element.className),
              size,
              text: directText.slice(0, 80),
            },
          ]
        : [];
    });
  });
  expect(offenders).toEqual([]);
});
