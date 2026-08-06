import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Load axe as an inert string and evaluate it only inside the browser page.
// Requiring axe-core in Node breaks under this repository's node_modules
// symlink layout, because the Playwright transform then treats the UMD build
// as ESM and its top-level `this` becomes undefined.
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

export async function analyzeAccessibility(page) {
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => {
    const outcome = await window.axe.run(document.documentElement);
    return outcome.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));
  });
  return { violations };
}

export function severeViolations(results) {
  return results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );
}
