import { expect, test } from '@playwright/test'

const catalogPath = '/decks/medical-template-catalog/index.html'

test('records the catalog browser baseline', async ({ page }, testInfo) => {
  const consoleErrors = []
  const failedRequests = []
  const externalRequests = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`)
  })
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url())
  })

  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto(catalogPath, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.documentElement.dataset.chartsReady === 'true')

  const baseline = await page.locator('.slide').evaluateAll((slides) => ({
    slideCount: slides.length,
    markerCount: slides.filter((slide) => (
      slide.querySelectorAll(':scope > .synthetic-marker').length === 1
      && slide.querySelector(':scope > .synthetic-marker')?.textContent?.includes('NOT FOR CLINICAL OR ACADEMIC USE')
    )).length,
    overflowCount: slides.filter((slide) => (
      slide.scrollWidth > slide.clientWidth + 1 || slide.scrollHeight > slide.clientHeight + 1
    )).length,
  }))
  const chartStatus = await page.locator('.chart-host').evaluateAll((charts) => ({
    count: charts.length,
    ready: charts.filter((chart) => chart.dataset.chartReady === 'true' && chart.querySelector('svg')).length,
  }))
  const nntValues = await page.locator('[data-nnt-value]').allTextContents()

  const pdf = await page.pdf({
    width: '13.333333in',
    height: '7.5in',
    printBackground: true,
  })
  const pdfText = pdf.toString('latin1')
  const pdfPageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length

  await testInfo.attach('baseline.json', {
    body: JSON.stringify({ ...baseline, ...chartStatus, pdfPageCount, consoleErrors, failedRequests, externalRequests, nntValues }, null, 2),
    contentType: 'application/json',
  })
  console.info(JSON.stringify({ ...baseline, ...chartStatus, pdfPageCount, consoleErrors, failedRequests, externalRequests, nntValues }))

  expect(baseline.slideCount).toBeGreaterThan(0)
  expect(baseline.markerCount).toBe(baseline.slideCount)
  expect(baseline.overflowCount).toBe(0)
  expect(chartStatus.count).toBeGreaterThan(0)
  expect(chartStatus.ready).toBe(chartStatus.count)
  expect(nntValues).toEqual(nntValues.map(() => '22'))
  const kmSeries = await page.locator('[data-line-style]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      lineStyle: node.getAttribute('data-line-style'),
      dash: getComputedStyle(node).strokeDasharray,
    })),
  )
  expect(kmSeries).toEqual([
    { lineStyle: 'solid', dash: 'none' },
    { lineStyle: 'dashed', dash: '12px, 7px' },
  ])
  await expect(page.getByText(/Group B \(dashed\)/).first()).toHaveText(/Group B \(dashed\)/)
  expect(consoleErrors).toEqual([])
  expect(failedRequests).toEqual([])
  expect(externalRequests).toEqual([])
  expect(pdfPageCount).toBe(baseline.slideCount)
})
