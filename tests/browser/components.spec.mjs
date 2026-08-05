import { expect, test } from '@playwright/test'

test('choice cards work with keyboard without advancing the deck', async ({ page }) => {
  await page.goto('/decks/medical-template-catalog/index.html')
  const slideIndex = await page.locator('.slide').evaluateAll((slides) => slides.findIndex((slide) => slide.querySelector('.choice-list')))
  expect(slideIndex).toBeGreaterThanOrEqual(0)
  const slideId = await page.locator('.slide').nth(slideIndex).getAttribute('id')
  await page.goto(`/decks/medical-template-catalog/index.html#${slideId}`)

  const slide = page.locator('.slide').nth(slideIndex)
  await expect(slide).toHaveClass(/is-active/)
  await expect(slide).not.toHaveAttribute('inert', '')
  const radios = slide.locator('input[type="radio"]')
  await expect(radios).toHaveCount(4)
  expect(await radios.evaluateAll((inputs) => inputs.every((input) => !input.checked))).toBe(true)

  await radios.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await expect(radios.nth(1)).toBeChecked()
  await expect(slide).toHaveClass(/is-active/)

  const surface = slide.locator('.choice-card__surface').nth(1)
  const size = await surface.boundingBox()
  expect(size.height).toBeGreaterThanOrEqual(44)
  expect(await surface.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none')
})

test('answer and differential states remain explicit without color', async ({ page }) => {
  await page.goto('/decks/medical-template-catalog/index.html')
  const answer = page.locator('.answer-reveal')
  await expect(answer).toHaveCount(1)
  await expect(answer.locator('[data-state="correct"]')).toContainText('正答')
  await expect(answer.locator('[data-state="incorrect"]').first()).toContainText('誤答')

  const differential = page.locator('.differential-choice')
  await expect(differential).toHaveCount(1)
  await expect(differential.locator('[data-evidence="supports"]').first()).toContainText('支持')
  await expect(differential.locator('[data-evidence="against"]').first()).toContainText('反証')
})

test('choice state stays visible in print', async ({ page }) => {
  await page.goto('/decks/medical-template-catalog/index.html')
  const radio = page.locator('.choice-list input[type="radio"]').nth(0)
  await radio.evaluate((input) => { input.checked = true })
  await page.emulateMedia({ media: 'print' })
  const surface = radio.locator('+ .choice-card__surface')
  await expect(surface).toHaveCSS('border-style', 'solid')
  await expect(surface).toHaveCSS('border-width', '3px')
})
