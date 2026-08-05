import { expect, test } from '@playwright/test'

test('radial helper creates finite, distinct positions', async ({ page }) => {
  await page.goto('/decks/medical-template-catalog/index.html')
  const positions = await page.evaluate(async () => {
    const { layoutRadials } = await import('/engine/layout.js')
    const radial = document.createElement('div')
    radial.className = 'radial'
    radial.dataset.radius = '120'
    radial.style.cssText = 'position:relative;flex:none;width:400px;height:400px;'
    for (let index = 0; index < 4; index += 1) {
      const item = document.createElement('div')
      item.className = 'radial-item'
      item.style.cssText = 'position:absolute;width:100px;height:100px;'
      radial.appendChild(item)
    }
    document.body.appendChild(radial)
    layoutRadials(radial)
    const parent = radial.getBoundingClientRect()
    return [...radial.children].map((item) => {
      const rect = item.getBoundingClientRect()
      return { x: rect.x - parent.x, y: rect.y - parent.y }
    })
  })
  expect(new Set(positions.map(({ x, y }) => `${x}|${y}`)).size).toBe(4)
  for (const position of positions) {
    expect(Number.isFinite(position.x)).toBe(true)
    expect(Number.isFinite(position.y)).toBe(true)
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
    expect(position.x).toBeLessThanOrEqual(300)
    expect(position.y).toBeLessThanOrEqual(300)
  }
})
