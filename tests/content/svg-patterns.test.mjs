import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const directory = 'assets/svg-patterns'
const expected = [
  'anatomy-callout.svg',
  'branch.svg',
  'causal-path.svg',
  'clinical-timeline.svg',
  'comparison-rows.svg',
  'evidence-map.svg',
  'sequence.svg',
  'study-flow.svg',
]

test('ships the complete original SVG pattern library', () => {
  assert.deepEqual(readdirSync(directory).filter((name) => name.endsWith('.svg')).sort(), expected)
})

test('SVG IDs remain unique when the complete library is inserted together', () => {
  const ids = expected.flatMap((name) => [...readFileSync(`${directory}/${name}`, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]))
  assert.equal(new Set(ids).size, ids.length)
})

for (const name of expected) {
  test(`${name} has an accessible, offline, tokenized SVG contract`, () => {
    const svg = readFileSync(`${directory}/${name}`, 'utf8')
    const prefix = name.replace(/\.svg$/, '')
    assert.match(svg, /<svg[^>]+width="1440" height="810"[^>]+viewBox="0 0 1440 810"/)
    assert.match(svg, /style="width:100%;height:auto;display:block"/)
    assert.match(svg, /role="img"/)
    assert.match(svg, new RegExp(`aria-labelledby="${prefix}-title ${prefix}-desc"`))
    assert.match(svg, new RegExp(`<title id="${prefix}-title">[^<]+<\\/title>`))
    assert.match(svg, new RegExp(`<desc id="${prefix}-desc">[^<]+<\\/desc>`))
    assert.match(svg, /--bg:/)
    assert.match(svg, /--ink:/)
    assert.match(svg, /--accent:/)
    const declaredFontSizes = [...svg.matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]))
    assert.ok(declaredFontSizes.length > 0)
    assert.ok(declaredFontSizes.every((size) => size >= 18), `SVG text below 18px: ${declaredFontSizes.filter((size) => size < 18)}`)
    assert.doesNotMatch(svg.replace('http://www.w3.org/2000/svg', ''), /https?:\/\//)
    assert.doesNotMatch(svg, /[^一-鿿]\s*(?:→|⇒|➔|->)\s*/)
    assert.doesNotMatch(svg, /<image\b|<script\b|<foreignObject\b/)
  })
}

test('causal path uses explicitly directed solid and dashed connectors', () => {
  const svg = readFileSync(`${directory}/causal-path.svg`, 'utf8')
  assert.match(svg, /marker-end="url\(#causal-path-arrow\)"/)
  assert.match(svg, /stroke-dasharray="10 7" marker-end="url\(#causal-path-arrow\)"/)
  assert.match(svg, /Solid arrow = specified direction/)
})
