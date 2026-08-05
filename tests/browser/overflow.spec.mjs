import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 1024, height: 768 },
]) {
  test(`catalog has no intrinsic slide overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/decks/medical-template-catalog/index.html', { waitUntil: 'networkidle' })
    const overflow = await page.locator('.slide').evaluateAll((slides) => slides
      .map((slide, index) => ({ index, x: slide.scrollWidth - slide.clientWidth, y: slide.scrollHeight - slide.clientHeight }))
      .filter((item) => item.x > 1 || item.y > 1))
    expect(overflow).toEqual([])
  })
}
