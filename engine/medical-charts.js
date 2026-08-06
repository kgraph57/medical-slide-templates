import { nullValueFor, validateEstimate } from "./medical-math.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = ["#1a5fb4", "#5c6470", "#8b5e00", "#6d3a8a"];

function finite(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new TypeError(`${label} must be finite`);
  return value;
}

function domainPair(domain, label) {
  if (!Array.isArray(domain) || domain.length !== 2)
    throw new TypeError(`${label} must contain two values`);
  const [low, high] = domain.map((value, index) =>
    finite(value, `${label}[${index}]`),
  );
  if (low >= high) throw new RangeError(`${label} must be increasing`);
  return [low, high];
}

export function linearScale(value, domain, range) {
  const [d0, d1] = domainPair(domain, "domain");
  if (!Array.isArray(range) || range.length !== 2)
    throw new TypeError("range must contain two values");
  const [r0, r1] = range.map((item, index) => finite(item, `range[${index}]`));
  if (r0 === r1) throw new RangeError("range values must differ");
  return r0 + ((finite(value, "value") - d0) / (d1 - d0)) * (r1 - r0);
}

export function logScale(value, domain, range) {
  const [d0, d1] = domainPair(domain, "domain");
  const point = finite(value, "value");
  if (point <= 0 || d0 <= 0)
    throw new RangeError("log scale values must be positive");
  return linearScale(Math.log(point), [Math.log(d0), Math.log(d1)], range);
}

export function forestGeometry(data, { x = 180, width = 600 } = {}) {
  const scale = [
    "risk-ratio",
    "odds-ratio",
    "hazard-ratio",
    "rate-ratio",
  ].includes(data.measure)
    ? logScale
    : linearScale;
  const range = [x, x + width];
  if (!Array.isArray(data.rows) || data.rows.length === 0)
    throw new RangeError("forest plot requires at least one row");
  const nullValue = nullValueFor(data.measure);
  if (nullValue < data.domain[0] || nullValue > data.domain[1])
    throw new RangeError("forest plot null value must be inside the domain");
  const rows = data.rows.map((row) => {
    validateEstimate({ measure: data.measure, ...row });
    if (row.lower < data.domain[0] || row.upper > data.domain[1])
      throw new RangeError(
        "forest confidence interval must be inside the domain",
      );
    return {
      ...row,
      lowerX: scale(row.lower, data.domain, range),
      estimateX: scale(row.estimate, data.domain, range),
      upperX: scale(row.upper, data.domain, range),
    };
  });
  return {
    rows,
    nullX: scale(nullValue, data.domain, range),
    domain: data.domain,
    measure: data.measure,
  };
}

export function validateKaplanMeier(data) {
  if (!Array.isArray(data.timePoints) || data.timePoints.length < 2)
    throw new RangeError("timePoints are required");
  data.timePoints.forEach((value, index) => {
    finite(value, `timePoints[${index}]`);
    if (index > 0 && value <= data.timePoints[index - 1])
      throw new RangeError("timePoints must be increasing");
  });
  if (!Array.isArray(data.groups) || data.groups.length < 1)
    throw new RangeError("at least one group is required");
  for (const [groupIndex, group] of data.groups.entries()) {
    if (group.survival?.length !== data.timePoints.length)
      throw new RangeError(`group ${groupIndex} survival length mismatch`);
    if (group.atRisk?.length !== data.timePoints.length)
      throw new RangeError(`group ${groupIndex} at-risk length mismatch`);
    if (!Array.isArray(group.censors) || group.censors.length === 0)
      throw new RangeError(`group ${groupIndex} censor times are required`);
    group.survival.forEach((value, index) => {
      finite(value, `group ${groupIndex} survival[${index}]`);
      if (value < 0 || value > 1)
        throw new RangeError("survival values must be proportions");
      if (index > 0 && value > group.survival[index - 1])
        throw new RangeError("survival must be non-increasing");
    });
    group.atRisk.forEach((value, index) => {
      if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError(
          "at-risk counts must be non-negative safe integers",
        );
      if (index > 0 && value > group.atRisk[index - 1])
        throw new RangeError("at-risk counts must be non-increasing");
    });
    group.censors.forEach((value) => {
      finite(value, "censor time");
      if (value < data.timePoints[0] || value > data.timePoints.at(-1))
        throw new RangeError("censor time is outside the time axis");
    });
  }
  return true;
}

export function validateRocCurve(data) {
  if (!Array.isArray(data.points) || data.points.length < 2)
    throw new RangeError("ROC points are required");
  data.points.forEach((point, index) => {
    for (const key of ["threshold", "falsePositiveRate", "sensitivity"])
      finite(point[key], `ROC point ${index} ${key}`);
    if (
      point.falsePositiveRate < 0 ||
      point.falsePositiveRate > 1 ||
      point.sensitivity < 0 ||
      point.sensitivity > 1
    ) {
      throw new RangeError("ROC rates must be proportions from 0 to 1");
    }
    if (
      index > 0 &&
      (point.falsePositiveRate < data.points[index - 1].falsePositiveRate ||
        point.sensitivity < data.points[index - 1].sensitivity)
    )
      throw new RangeError(
        "ROC false-positive rate and sensitivity must be non-decreasing",
      );
  });
  const first = data.points[0];
  const last = data.points.at(-1);
  if (
    first.falsePositiveRate !== 0 ||
    first.sensitivity !== 0 ||
    last.falsePositiveRate !== 1 ||
    last.sensitivity !== 1
  ) {
    throw new RangeError(
      "complete ROC curve must start at (0,0) and end at (1,1)",
    );
  }
  finite(data.selectedThreshold, "selectedThreshold");
  if (
    !data.points.some((point) => point.threshold === data.selectedThreshold)
  ) {
    throw new RangeError("selectedThreshold must match a plotted ROC point");
  }
  return true;
}

export function rocMetrics(data) {
  validateRocCurve(data);
  let auc = 0;
  for (let index = 1; index < data.points.length; index += 1) {
    const previous = data.points[index - 1];
    const current = data.points[index];
    auc +=
      ((current.falsePositiveRate - previous.falsePositiveRate) *
        (current.sensitivity + previous.sensitivity)) /
      2;
  }
  const selected = data.points.find(
    (point) => point.threshold === data.selectedThreshold,
  );
  return {
    auc: Number(auc.toFixed(12)),
    threshold: selected.threshold,
    sensitivity: selected.sensitivity,
    specificity: Number((1 - selected.falsePositiveRate).toFixed(12)),
  };
}

export function validateLineChart(data) {
  if (
    !Array.isArray(data.labels) ||
    !Array.isArray(data.values) ||
    data.labels.length !== data.values.length
  ) {
    throw new RangeError(
      "line chart labels and values must have the same length",
    );
  }
  if (data.values.length < 2)
    throw new RangeError("line chart requires at least two values");
  const [low, high] = domainPair(data.domain, "line chart domain");
  data.values.forEach((value, index) => {
    finite(value, `line value ${index}`);
    if (value < low || value > high)
      throw new RangeError("line chart value is outside its domain");
  });
  return true;
}

export function validateWaterfall(data) {
  if (!Array.isArray(data.values) || data.values.length === 0)
    throw new RangeError("waterfall values are required");
  const [low, high] = domainPair(data.domain, "waterfall domain");
  if (low > 0 || high < 0)
    throw new RangeError("waterfall domain must include zero");
  data.values.forEach((value, index) => {
    finite(value, `waterfall value ${index}`);
    if (value < low || value > high)
      throw new RangeError("waterfall value is outside its domain");
  });
  finite(data.threshold, "waterfall threshold");
  if (data.threshold < low || data.threshold > high)
    throw new RangeError("waterfall threshold is outside its domain");
  return true;
}

export function validateFunnel(data) {
  const [xLow, xHigh] = domainPair(data.xDomain, "funnel xDomain");
  const [yLow, yHigh] = domainPair(data.yDomain, "funnel yDomain");
  finite(data.center, "funnel center");
  if (data.center < xLow || data.center > xHigh)
    throw new RangeError("funnel center is outside xDomain");
  if (yLow !== 0)
    throw new RangeError("funnel standard error domain must start at zero");
  if (!Array.isArray(data.points) || data.points.length < 2)
    throw new RangeError("funnel points are required");
  data.points.forEach(([estimate, standardError], index) => {
    finite(estimate, `funnel point ${index} estimate`);
    finite(standardError, `funnel point ${index} standard error`);
    if (standardError < 0)
      throw new RangeError("funnel standard error must be non-negative");
    if (
      estimate < xLow ||
      estimate > xHigh ||
      standardError < yLow ||
      standardError > yHigh
    ) {
      throw new RangeError("funnel point is outside its domain");
    }
  });
  const boundary = 1.96 * yHigh;
  if (data.center - boundary < xLow || data.center + boundary > xHigh) {
    throw new RangeError("funnel confidence boundaries are outside xDomain");
  }
  return true;
}

export function funnelGeometry(data) {
  validateFunnel(data);
  const maxError = data.yDomain[1];
  return {
    left: [
      [data.center, 0],
      [Number((data.center - 1.96 * maxError).toFixed(12)), maxError],
    ],
    right: [
      [data.center, 0],
      [Number((data.center + 1.96 * maxError).toFixed(12)), maxError],
    ],
  };
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes))
    element.setAttribute(key, String(value));
  return element;
}

function text(svg, value, x, y, attributes = {}) {
  const element = svgElement("text", { x, y, ...attributes });
  element.textContent = String(value);
  svg.appendChild(element);
  return element;
}

function chartRoot(title, description, width, height) {
  const svg = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-labelledby": `${title.id} ${description.id}`,
  });
  const titleElement = svgElement("title", { id: title.id });
  titleElement.textContent = title.text;
  const descriptionElement = svgElement("desc", { id: description.id });
  descriptionElement.textContent = description.text;
  svg.append(titleElement, descriptionElement);
  return svg;
}

/** Evenly spaced linear ticks inclusive of domain ends. */
export function linearTicks(domain, count = 5) {
  const [d0, d1] = domainPair(domain, "domain");
  const steps = Math.max(2, count);
  return Array.from(
    { length: steps },
    (_, index) => d0 + ((d1 - d0) * index) / (steps - 1),
  );
}

/** Round-number ticks for chart axes (includes 0 when domain crosses it). */
export function niceLinearTicks(domain, count = 5) {
  const [d0, d1] = domainPair(domain, "domain");
  const span = d1 - d0;
  if (span === 0) return [d0];
  const rough = span / Math.max(2, count - 1);
  const power = 10 ** Math.floor(Math.log10(Math.abs(rough)));
  const niceStep =
    [1, 2, 2.5, 5, 10]
      .map((multiplier) => multiplier * power)
      .find((step) => step >= rough) ?? rough;
  const start = Math.ceil(d0 / niceStep - 1e-12) * niceStep;
  const ticks = [];
  for (let value = start; value <= d1 + niceStep * 1e-9; value += niceStep) {
    ticks.push(Number(value.toFixed(10)));
  }
  if (d0 < 0 && d1 > 0 && !ticks.some((tick) => Math.abs(tick) < 1e-12)) {
    ticks.push(0);
  }
  return [...new Set(ticks)].sort((a, b) => a - b);
}

/** Prefer classic ratio ticks that sit inside a positive domain. */
export function ratioTicks(domain) {
  const [d0, d1] = domainPair(domain, "domain");
  const candidates = [0.25, 0.5, 1, 2, 4, 8];
  const inside = candidates.filter((value) => value >= d0 && value <= d1);
  return inside.length >= 2 ? inside : linearTicks(domain, 5);
}

function formatTick(value) {
  if (Math.abs(value) >= 10 || Number.isInteger(value))
    return String(Number(value.toFixed(0)));
  if (Math.abs(value) >= 1) return String(Number(value.toFixed(1)));
  return String(Number(value.toFixed(2)));
}

function drawBoxAxes(svg, plot) {
  svg.appendChild(
    svgElement("line", {
      x1: plot.left,
      x2: plot.left,
      y1: plot.top,
      y2: plot.bottom,
      class: "chart-axis",
    }),
  );
  svg.appendChild(
    svgElement("line", {
      x1: plot.left,
      x2: plot.right,
      y1: plot.bottom,
      y2: plot.bottom,
      class: "chart-axis",
    }),
  );
}

function drawYTicks(
  svg,
  plot,
  domain,
  yScale,
  { count = 5, format = formatTick, nice = false, ticks } = {},
) {
  const values =
    ticks ??
    (nice ? niceLinearTicks(domain, count) : linearTicks(domain, count));
  for (const value of values) {
    const y = yScale(value);
    svg.appendChild(
      svgElement("line", {
        x1: plot.left - 6,
        x2: plot.left,
        y1: y,
        y2: y,
        class: "chart-axis",
      }),
    );
    text(svg, format(value), plot.left - 12, y + 6, {
      class: "chart-tick",
      "text-anchor": "end",
    });
  }
}

function drawXTicks(
  svg,
  plot,
  domain,
  xScale,
  { count = 5, format = formatTick, yOffset = 22, ticks } = {},
) {
  for (const value of ticks ?? linearTicks(domain, count)) {
    const x = xScale(value);
    svg.appendChild(
      svgElement("line", {
        x1: x,
        x2: x,
        y1: plot.bottom,
        y2: plot.bottom + 6,
        class: "chart-axis",
      }),
    );
    text(svg, format(value), x, plot.bottom + yOffset, {
      class: "chart-tick",
      "text-anchor": "middle",
    });
  }
}

function axisLabel(svg, value, x, y, attributes = {}) {
  text(svg, value, x, y, { class: "chart-axis-label", ...attributes });
}

function replaceChart(element, svg, table) {
  element.replaceChildren(svg, table);
  element.dataset.chartReady = "true";
  element.setAttribute("aria-busy", "false");
}

function dataTable(headers, rows, caption) {
  const table = document.createElement("table");
  table.className = "chart-data-table sr-only";
  const captionElement = document.createElement("caption");
  captionElement.textContent = caption;
  table.appendChild(captionElement);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const header of headers) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = header;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  const tbody = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    row.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      if (index === 0) cell.scope = "row";
      cell.textContent = String(value);
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  }
  table.append(thead, tbody);
  return table;
}

export function renderForestPlot(element, data) {
  const width = 960;
  const rowHeight = 58;
  const axisBand = 56;
  const topPad = 28;
  const height = topPad + 24 + data.rows.length * rowHeight + axisBand;
  const plotX = 210;
  const plotW = 560;
  const geometry = forestGeometry(data, { x: plotX, width: plotW });
  const isRatio = [
    "risk-ratio",
    "odds-ratio",
    "hazard-ratio",
    "rate-ratio",
  ].includes(data.measure);
  const scale = isRatio ? logScale : linearScale;
  const id = `forest-${crypto.randomUUID()}`;
  const svg = chartRoot(
    { id: `${id}-title`, text: "Forest plot" },
    {
      id: `${id}-desc`,
      text: "Point estimates and confidence intervals generated from the accompanying data table.",
    },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  const plotTop = topPad;
  const plotBottom = topPad + 8 + data.rows.length * rowHeight;
  svg.appendChild(
    svgElement("line", {
      x1: geometry.nullX,
      x2: geometry.nullX,
      y1: plotTop,
      y2: plotBottom,
      class: "chart-null",
    }),
  );
  geometry.rows.forEach((row, index) => {
    const y = topPad + 34 + index * rowHeight;
    text(svg, row.label, 16, y + 5, { class: "chart-label" });
    svg.appendChild(
      svgElement("line", {
        x1: row.lowerX,
        x2: row.upperX,
        y1: y,
        y2: y,
        class: "chart-ci",
      }),
    );
    svg.appendChild(
      svgElement(
        row.summary ? "polygon" : "circle",
        row.summary
          ? {
              points: `${row.estimateX},${y - 10} ${row.estimateX + 12},${y} ${row.estimateX},${y + 10} ${row.estimateX - 12},${y}`,
              class: "chart-point",
            }
          : { cx: row.estimateX, cy: y, r: 7, class: "chart-point" },
      ),
    );
    text(
      svg,
      `${row.estimate.toFixed(2)} (${row.lower.toFixed(2)}–${row.upper.toFixed(2)})`,
      792,
      y + 5,
      { class: "chart-value" },
    );
  });
  const axisY = plotBottom + 8;
  svg.appendChild(
    svgElement("line", {
      x1: plotX,
      x2: plotX + plotW,
      y1: axisY,
      y2: axisY,
      class: "chart-axis",
    }),
  );
  const ticks = isRatio ? ratioTicks(data.domain) : linearTicks(data.domain, 5);
  for (const value of ticks) {
    const x = scale(value, data.domain, [plotX, plotX + plotW]);
    svg.appendChild(
      svgElement("line", {
        x1: x,
        x2: x,
        y1: axisY,
        y2: axisY + 6,
        class: "chart-axis",
      }),
    );
    text(svg, formatTick(value), x, axisY + 24, {
      class: "chart-tick",
      "text-anchor": "middle",
    });
  }
  const measureLabel =
    data.measureLabel ||
    ({
      "risk-ratio": "Risk ratio",
      "odds-ratio": "Odds ratio",
      "hazard-ratio": "Hazard ratio",
      "rate-ratio": "Rate ratio",
    }[data.measure] ??
      "Effect");
  axisLabel(svg, measureLabel, plotX + plotW / 2, height - 8, {
    "text-anchor": "middle",
  });
  const table = dataTable(
    ["Study", "Estimate", "Lower CI", "Upper CI"],
    data.rows.map((row) => [row.label, row.estimate, row.lower, row.upper]),
    "Forest plot data",
  );
  replaceChart(element, svg, table);
}

function stepPath(times, values, xScale, yScale) {
  let path = `M ${xScale(times[0])} ${yScale(values[0])}`;
  for (let index = 1; index < times.length; index += 1) {
    path += ` H ${xScale(times[index])} V ${yScale(values[index])}`;
  }
  return path;
}

export function renderKaplanMeier(element, data) {
  validateKaplanMeier(data);
  const width = 960;
  const plot = { left: 108, right: 900, top: 36, bottom: 268 };
  const narRowH = 28;
  const narTop = plot.bottom + 58;
  const height = narTop + 22 + data.groups.length * narRowH + 12;
  const x = (value) =>
    linearScale(
      value,
      [data.timePoints[0], data.timePoints.at(-1)],
      [plot.left, plot.right],
    );
  const y = (value) => linearScale(value, [0, 1], [plot.bottom, plot.top]);
  const id = `km-${crypto.randomUUID()}`;
  const timeUnit = data.timeUnit || "Time";
  const svg = chartRoot(
    { id: `${id}-title`, text: "Kaplan-Meier plot" },
    {
      id: `${id}-desc`,
      text: "Step curves include censor marks. Number at Risk is shown below the time axis.",
    },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  drawBoxAxes(svg, plot);
  drawYTicks(svg, plot, [0, 1], y, {
    count: 5,
    format: (value) => value.toFixed(2),
  });
  axisLabel(svg, "Survival", 22, (plot.top + plot.bottom) / 2 + 4, {
    "text-anchor": "middle",
    transform: `rotate(-90 22 ${(plot.top + plot.bottom) / 2})`,
  });
  data.groups.forEach((group, groupIndex) => {
    const color = COLORS[groupIndex % COLORS.length];
    const lineStyle = groupIndex % 2 === 0 ? "solid" : "dashed";
    const dashArray = lineStyle === "dashed" ? "12 7" : "none";
    svg.appendChild(
      svgElement("path", {
        d: stepPath(data.timePoints, group.survival, x, y),
        fill: "none",
        class: "chart-series",
        style: `stroke:${color};stroke-dasharray:${dashArray}`,
        "data-line-style": lineStyle,
      }),
    );
    group.censors.forEach((time) => {
      let pointIndex = 0;
      while (
        pointIndex + 1 < data.timePoints.length &&
        data.timePoints[pointIndex + 1] <= time
      )
        pointIndex += 1;
      const cx = x(time);
      const cy = y(group.survival[pointIndex]);
      svg.appendChild(
        svgElement("line", {
          x1: cx,
          x2: cx,
          y1: cy - 7,
          y2: cy + 7,
          stroke: color,
          class: "chart-censor",
        }),
      );
    });
    const legendX = plot.right - 150;
    const legendY = plot.top + 18 + groupIndex * 24;
    svg.appendChild(
      svgElement("line", {
        x1: legendX,
        x2: legendX + 28,
        y1: legendY - 4,
        y2: legendY - 4,
        class: "chart-series",
        style: `stroke:${color};stroke-dasharray:${dashArray}`,
      }),
    );
    text(svg, group.label, legendX + 36, legendY, {
      fill: color,
      class: "chart-label",
    });
  });
  drawXTicks(svg, plot, [data.timePoints[0], data.timePoints.at(-1)], x, {
    ticks: data.timePoints,
    format: (value) => String(value),
    yOffset: 22,
  });
  axisLabel(svg, timeUnit, (plot.left + plot.right) / 2, plot.bottom + 42, {
    "text-anchor": "middle",
  });
  text(svg, "Number at Risk", 8, narTop - 6, { class: "chart-label" });
  data.groups.forEach((group, groupIndex) => {
    const rowY = narTop + 18 + groupIndex * narRowH;
    const color = COLORS[groupIndex % COLORS.length];
    text(svg, group.label, 8, rowY, { fill: color, class: "chart-label" });
    group.atRisk.forEach((count, index) => {
      text(svg, count, x(data.timePoints[index]), rowY, {
        class: "chart-tick",
        "text-anchor": "middle",
      });
    });
  });
  const table = dataTable(
    ["Group", ...data.timePoints.map((time) => `Time ${time}`), "Censor times"],
    data.groups.map((group) => [
      group.label,
      ...group.atRisk,
      group.censors.join(", "),
    ]),
    "Kaplan-Meier Number at Risk and censoring data",
  );
  replaceChart(element, svg, table);
}

export function renderRocCurve(element, data) {
  const metrics = rocMetrics(data);
  const width = 560;
  const height = 420;
  const plot = { left: 72, right: 500, top: 28, bottom: 340 };
  const id = `roc-${crypto.randomUUID()}`;
  const svg = chartRoot(
    { id: `${id}-title`, text: "ROC curve" },
    { id: `${id}-desc`, text: "Sensitivity by false-positive rate." },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  const x = (value) => linearScale(value, [0, 1], [plot.left, plot.right]);
  const y = (value) => linearScale(value, [0, 1], [plot.bottom, plot.top]);
  drawBoxAxes(svg, plot);
  drawYTicks(svg, plot, [0, 1], y, {
    count: 5,
    format: (value) => value.toFixed(1),
  });
  drawXTicks(svg, plot, [0, 1], x, {
    count: 5,
    format: (value) => value.toFixed(1),
  });
  axisLabel(svg, "Sensitivity", 18, (plot.top + plot.bottom) / 2, {
    "text-anchor": "middle",
    transform: `rotate(-90 18 ${(plot.top + plot.bottom) / 2})`,
  });
  axisLabel(svg, "1 − Specificity", (plot.left + plot.right) / 2, height - 12, {
    "text-anchor": "middle",
  });
  svg.append(
    svgElement("line", {
      x1: x(0),
      y1: y(0),
      x2: x(1),
      y2: y(1),
      class: "chart-reference",
    }),
  );
  svg.append(
    svgElement("polyline", {
      points: data.points
        .map((point) => `${x(point.falsePositiveRate)},${y(point.sensitivity)}`)
        .join(" "),
      fill: "none",
      class: "chart-series",
    }),
  );
  const selected = data.points.find(
    (point) => point.threshold === data.selectedThreshold,
  );
  svg.append(
    svgElement("circle", {
      cx: x(selected.falsePositiveRate),
      cy: y(selected.sensitivity),
      r: 8,
      class: "chart-point",
    }),
  );
  text(svg, `AUC ${metrics.auc.toFixed(2)}`, plot.right - 8, plot.top + 22, {
    class: "chart-label",
    "text-anchor": "end",
  });
  replaceChart(
    element,
    svg,
    dataTable(
      ["Threshold", "False-positive rate", "Sensitivity"],
      data.points.map((point) => [
        point.threshold,
        point.falsePositiveRate,
        point.sensitivity,
      ]),
      "ROC curve data",
    ),
  );
  return metrics;
}

export function renderLineChart(element, data) {
  validateLineChart(data);
  const width = 900;
  const height = 210;
  const plot = { left: 56, right: 860, top: 24, bottom: 150 };
  const id = `line-${crypto.randomUUID()}`;
  const svg = chartRoot(
    { id: `${id}-title`, text: data.title },
    { id: `${id}-desc`, text: data.description },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  const x = (index) =>
    linearScale(index, [0, data.values.length - 1], [plot.left, plot.right]);
  const y = (value) => linearScale(value, data.domain, [plot.bottom, plot.top]);
  drawBoxAxes(svg, plot);
  drawYTicks(svg, plot, data.domain, y, { count: 4 });
  data.labels.forEach((label, index) => {
    text(svg, label, x(index), plot.bottom + 24, {
      class: "chart-tick",
      "text-anchor": "middle",
    });
  });
  svg.append(
    svgElement("polyline", {
      points: data.values
        .map((value, index) => `${x(index)},${y(value)}`)
        .join(" "),
      fill: "none",
      class: "chart-series",
    }),
  );
  replaceChart(
    element,
    svg,
    dataTable(
      ["Time", "Value"],
      data.values.map((value, index) => [data.labels[index], value]),
      data.title,
    ),
  );
}

export function renderWaterfall(element, data) {
  validateWaterfall(data);
  const width = 960;
  const height = 420;
  const plot = { left: 88, right: 900, top: 28, bottom: 340 };
  const id = `waterfall-${crypto.randomUUID()}`;
  const svg = chartRoot(
    { id: `${id}-title`, text: "Waterfall plot" },
    {
      id: `${id}-desc`,
      text: "Individual synthetic changes sorted from lowest to highest.",
    },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  const y = (value) => linearScale(value, data.domain, [plot.bottom, plot.top]);
  const zero = y(0);
  const barWidth = (plot.right - plot.left) / data.values.length;
  drawBoxAxes(svg, plot);
  drawYTicks(svg, plot, data.domain, y, {
    count: 5,
    nice: true,
    format: (value) => `${formatTick(value)}%`,
  });
  axisLabel(svg, "Change (%)", 22, (plot.top + plot.bottom) / 2, {
    "text-anchor": "middle",
    transform: `rotate(-90 22 ${(plot.top + plot.bottom) / 2})`,
  });
  svg.appendChild(
    svgElement("line", {
      x1: plot.left,
      x2: plot.right,
      y1: zero,
      y2: zero,
      class: "chart-null",
    }),
  );
  data.values.forEach((value, index) => {
    const top = Math.min(zero, y(value));
    svg.appendChild(
      svgElement("rect", {
        x: plot.left + index * barWidth,
        y: top,
        width: Math.max(2, barWidth - 2),
        height: Math.abs(y(value) - zero),
        class: value <= 0 ? "chart-bar" : "chart-bar-negative",
      }),
    );
  });
  svg.appendChild(
    svgElement("line", {
      x1: plot.left,
      x2: plot.right,
      y1: y(data.threshold),
      y2: y(data.threshold),
      class: "chart-reference",
    }),
  );
  axisLabel(
    svg,
    "Participants (sorted)",
    (plot.left + plot.right) / 2,
    height - 12,
    { "text-anchor": "middle" },
  );
  replaceChart(
    element,
    svg,
    dataTable(
      ["Participant", "Change"],
      data.values.map((value, index) => [`P${index + 1}`, value]),
      "Waterfall plot data",
    ),
  );
}

export function renderFunnel(element, data) {
  const geometry = funnelGeometry(data);
  const width = 960;
  const height = 420;
  const plot = { left: 100, right: 880, top: 36, bottom: 340 };
  const id = `funnel-${crypto.randomUUID()}`;
  const svg = chartRoot(
    { id: `${id}-title`, text: "Funnel plot" },
    {
      id: `${id}-desc`,
      text: "Synthetic effect estimates by standard error; asymmetry is not proof for or against publication bias.",
    },
    width,
    height,
  );
  svg.classList.add("medical-chart");
  const x = (value) =>
    linearScale(value, data.xDomain, [plot.left, plot.right]);
  const y = (value) =>
    linearScale(value, data.yDomain, [plot.top, plot.bottom]);
  drawBoxAxes(svg, plot);
  drawYTicks(svg, plot, data.yDomain, y, { count: 5 });
  drawXTicks(svg, plot, data.xDomain, x, { count: 5 });
  axisLabel(svg, "Standard error", 24, (plot.top + plot.bottom) / 2, {
    "text-anchor": "middle",
    transform: `rotate(-90 24 ${(plot.top + plot.bottom) / 2})`,
  });
  axisLabel(svg, "Effect estimate", (plot.left + plot.right) / 2, height - 12, {
    "text-anchor": "middle",
  });
  svg.appendChild(
    svgElement("line", {
      x1: x(data.center),
      x2: x(data.center),
      y1: y(data.yDomain[0]),
      y2: y(data.yDomain[1]),
      class: "chart-reference",
    }),
  );
  for (const boundary of [geometry.left, geometry.right]) {
    svg.appendChild(
      svgElement("line", {
        x1: x(boundary[0][0]),
        y1: y(boundary[0][1]),
        x2: x(boundary[1][0]),
        y2: y(boundary[1][1]),
        class: "chart-reference",
      }),
    );
  }
  data.points.forEach(([estimate, error]) =>
    svg.appendChild(
      svgElement("circle", {
        cx: x(estimate),
        cy: y(error),
        r: 6,
        class: "chart-point",
      }),
    ),
  );
  replaceChart(
    element,
    svg,
    dataTable(["Estimate", "Standard error"], data.points, "Funnel plot data"),
  );
}
