/**
 * Brightstar.AI B.AI Screening Assessment - PPTX Generator (v4)
 *
 * Usage: node generate_pptx.js <scoring_data.json> <output_path.pptx>
 *
 * Aligned with Brightstar Screening AI & Tech Criteria v4:
 * - Value Creation: 7 categories in 3 tiers (1-5 each, Tier 3 weighted 3×, total 11-55)
 * - Disruption Risk: 4 dimensions (1-5 each, total 4-20)
 * - PE Suitability: 10 criteria (0-2 each, total 0-20)
 * - Decisioning Matrix: Pursue / Monitor / Avoid
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");

// Read scoring data
const dataPath = process.argv[2] || "scoring_data.json";
const outputPath = process.argv[3] || "BAI_Screening_Assessment.pptx";
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Brightstar Brand Colors
const COLORS = {
  navy: "1A2B4A",
  darkNavy: "0F1B2D",
  teal: "0891B2",
  gold: "D4A843",
  white: "FFFFFF",
  offWhite: "F5F5F5",
  lightGray: "E5E7EB",
  medGray: "9CA3AF",
  darkGray: "374151",
  green: "059669",
  amber: "D97706",
  red: "DC2626",
  lightTeal: "ECFEFF",
  lightGold: "FFF8E1",
};

// Score color for VC (1-5 scale)
function vcScoreColor(score) {
  if (score >= 4) return COLORS.green;
  if (score >= 3) return COLORS.gold;
  return COLORS.red;
}

// Score color for VC total (11-55 scale, v4 with Tier 3 weighted 3×)
function vcTotalColor(total) {
  if (total >= 41) return COLORS.green;
  if (total >= 26) return COLORS.gold;
  return COLORS.red;
}

// Risk color for DR (1-5 scale, higher = worse)
function drScoreColor(score) {
  if (score <= 2) return COLORS.green;
  if (score <= 3) return COLORS.gold;
  return COLORS.red;
}

// Risk color for DR total (4-20 scale, v4, higher = worse)
function drTotalColor(total) {
  if (total <= 9) return COLORS.green;
  if (total <= 14) return COLORS.gold;
  return COLORS.red;
}

// Classification color (v4: Pursue/Monitor/Avoid only)
function classColor(classification) {
  if (classification === "Monitor" || classification === "Amber") return COLORS.amber;
  if (classification === "Pursue" || classification === "Green") return COLORS.green;
  if (classification === "Avoid" || classification === "Red") return COLORS.red;
  return COLORS.medGray;
}

// Score color for PE suitability (0-2 scale)
function peScoreColor(score) {
  if (score >= 2) return COLORS.green;
  if (score >= 1) return COLORS.gold;
  return COLORS.red;
}

// Score color for PE total (0-20 scale)
function peTotalColor(total) {
  if (total >= 14) return COLORS.green;
  if (total >= 7) return COLORS.gold;
  return COLORS.red;
}

// Tier label color
function tierColor(tier) {
  if (tier === "Revenue Transformation") return COLORS.teal;
  if (tier === "Revenue Optimization") return COLORS.gold;
  return COLORS.navy; // Cost Optimization
}

// Factory functions to avoid pptxgenjs mutation issues
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.1 });

// Initialize presentation
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Brightstar.AI";
pres.title = `B.AI Screening: ${data.companyName}`;

// === SLIDE 1: Title ===
let s1 = pres.addSlide();
s1.background = { color: COLORS.darkNavy };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s1.addText("BRIGHTSTAR.AI", {
  x: 0.8, y: 1.2, w: 8.4, h: 0.5,
  fontSize: 14, fontFace: "Arial", color: COLORS.gold,
  charSpacing: 6, bold: true
});

s1.addText(data.companyName.toUpperCase(), {
  x: 0.8, y: 1.9, w: 8.4, h: 1.0,
  fontSize: 40, fontFace: "Arial", color: COLORS.white, bold: true
});

s1.addText("B.AI Screening Assessment", {
  x: 0.8, y: 2.9, w: 8.4, h: 0.6,
  fontSize: 22, fontFace: "Arial", color: COLORS.teal
});

s1.addText(`${data.sector}  |  ${data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, {
  x: 0.8, y: 3.6, w: 8.4, h: 0.4,
  fontSize: 13, fontFace: "Arial", color: COLORS.medGray
});

s1.addText("CONFIDENTIAL", {
  x: 0.8, y: 4.8, w: 8.4, h: 0.3,
  fontSize: 10, fontFace: "Arial", color: COLORS.medGray, italic: true
});

// === SLIDE 2: Company Overview ===
let s2 = pres.addSlide();
s2.background = { color: COLORS.white };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s2.addText("Company Overview", {
  x: 0.6, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial", color: COLORS.navy, bold: true
});

// Key metrics boxes
const metrics = data.keyMetrics || [];
const metricW = 2.0;
const metricGap = 0.25;
const metricStartX = 0.6;

metrics.slice(0, 4).forEach((m, i) => {
  const x = metricStartX + i * (metricW + metricGap);
  s2.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.1, w: metricW, h: 1.1,
    fill: { color: COLORS.offWhite }, shadow: makeShadow()
  });
  s2.addText(m.value, {
    x, y: 1.15, w: metricW, h: 0.6,
    fontSize: 22, fontFace: "Arial", color: COLORS.navy, bold: true, align: "center", margin: 0
  });
  s2.addText(m.label, {
    x, y: 1.7, w: metricW, h: 0.4,
    fontSize: 10, fontFace: "Arial", color: COLORS.medGray, align: "center", margin: 0
  });
});

// Business description
s2.addText(data.businessDescription || "", {
  x: 0.6, y: 2.5, w: 8.8, h: 2.8,
  fontSize: 12, fontFace: "Arial", color: COLORS.darkGray, lineSpacingMultiple: 1.4
});

// === SLIDE 3: Value Creation Potential Scoring ===
let s3 = pres.addSlide();
s3.background = { color: COLORS.white };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s3.addText("AI Value Creation Potential", {
  x: 0.6, y: 0.3, w: 7, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: COLORS.navy, bold: true
});

// Overall score callout (v4: /55)
const vcTotal = data.vcTotalScore || 0;
const vcLvl = data.vcLevel || "Medium";
s3.addShape(pres.shapes.RECTANGLE, {
  x: 7.2, y: 0.2, w: 2.5, h: 0.75,
  fill: { color: COLORS.offWhite }, shadow: makeShadow()
});
s3.addText([
  { text: `${vcTotal}`, options: { fontSize: 22, bold: true, color: vcTotalColor(vcTotal) } },
  { text: ` / 35`, options: { fontSize: 11, color: COLORS.medGray } },
  { text: `  ${vcLvl}`, options: { fontSize: 12, bold: true, color: vcTotalColor(vcTotal) } },
], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: "center", valign: "middle", margin: 0 });

// Scale legend
s3.addText("Scale: 1 = Minimal (<1pp EBITDA)  |  2 = Low (1-3pp)  |  3 = Moderate (3-5pp)  |  4 = High (5-8pp)  |  5 = Transformative (>8pp)  |  Half-points allowed", {
  x: 0.6, y: 0.85, w: 8.8, h: 0.3,
  fontSize: 8, fontFace: "Arial", color: COLORS.medGray, italic: true
});

// Scoring table with tier grouping (AI Score + Non-AI Score)
const vcHeaders = [
  [
    { text: "Tier", options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: "Category", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
    { text: "AI", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: "center" } },
    { text: "Non-AI", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: "center" } },
    { text: "Rationale (AI)", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
  ]
];

const vcRows = [];
const vcCategories = data.valueCreation || {};
// v4 structure: valueCreation.categories.{Name: {score, nonAiScore, tier, rationale}}
Object.values(vcCategories).forEach((subs) => {
  Object.entries(subs).forEach(([subName, subData], idx) => {
    const bgColor = idx % 2 === 0 ? COLORS.offWhite : COLORS.white;
    const nonAi = subData.nonAiScore != null ? subData.nonAiScore : "-";
    const tier = subData.tier || "";
    vcRows.push([
      { text: tier, options: { fontSize: 7.5, italic: true, color: tierColor(tier), fill: { color: bgColor } } },
      { text: subName, options: { bold: true, fontSize: 10, color: COLORS.navy, fill: { color: bgColor } } },
      { text: String(subData.score), options: { fontSize: 14, bold: true, color: vcScoreColor(subData.score), align: "center", fill: { color: bgColor } } },
      { text: String(nonAi), options: { fontSize: 14, bold: true, color: vcScoreColor(typeof nonAi === "number" ? nonAi : 0), align: "center", fill: { color: bgColor } } },
      { text: subData.rationale || "", options: { fontSize: 7.5, color: COLORS.darkGray, fill: { color: bgColor } } },
    ]);
  });
});

// Totals row
const vcNonAiTotal = data.vcNonAiTotalScore || 0;
const vcNonAiLvl = data.vcNonAiLevel || "";
vcRows.push([
  { text: "", options: { fill: { color: COLORS.lightGray } } },
  { text: "TOTAL", options: { bold: true, fontSize: 11, color: COLORS.navy, fill: { color: COLORS.lightGray } } },
  { text: String(vcTotal), options: { fontSize: 14, bold: true, color: vcTotalColor(vcTotal), align: "center", fill: { color: COLORS.lightGray } } },
  { text: String(vcNonAiTotal), options: { fontSize: 14, bold: true, color: vcTotalColor(vcNonAiTotal), align: "center", fill: { color: COLORS.lightGray } } },
  { text: `AI: ${data.vcLevel || ""} (${vcTotal}/55)  |  Non-AI: ${vcNonAiLvl} (${vcNonAiTotal}/55)`, options: { fontSize: 9, bold: true, color: COLORS.darkGray, fill: { color: COLORS.lightGray } } },
]);

s3.addTable([...vcHeaders, ...vcRows], {
  x: 0.2, y: 1.2, w: 9.6,
  colW: [1.2, 1.5, 0.5, 0.6, 5.8],
  border: { pt: 0.5, color: COLORS.lightGray },
  autoPage: false,
  rowH: 0.5
});

// === SLIDE 4: Value Creation Deep Dive ===
let s4 = pres.addSlide();
s4.background = { color: COLORS.white };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s4.addText("Value Creation: Key AI Opportunities", {
  x: 0.6, y: 0.3, w: 9, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: COLORS.navy, bold: true
});

const topOpportunities = data.topOpportunities || [];
topOpportunities.slice(0, 3).forEach((opp, i) => {
  const y = 1.1 + i * 1.5;
  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 8.8, h: 1.3,
    fill: { color: COLORS.offWhite }, shadow: makeShadow()
  });
  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 0.06, h: 1.3,
    fill: { color: COLORS.teal }
  });
  s4.addText(opp.title, {
    x: 0.9, y: y + 0.05, w: 6, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: COLORS.navy, bold: true, margin: 0
  });
  s4.addText(opp.description, {
    x: 0.9, y: y + 0.4, w: 8.2, h: 0.8,
    fontSize: 10, fontFace: "Arial", color: COLORS.darkGray, margin: 0, lineSpacingMultiple: 1.3
  });
});

// === SLIDE 5: Disruption Risk Scoring ===
let s5 = pres.addSlide();
s5.background = { color: COLORS.white };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s5.addText("AI Disruption Risk Assessment", {
  x: 0.6, y: 0.3, w: 7, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: COLORS.navy, bold: true
});

// Overall risk callout (v4: /20)
const drTotal = data.drTotalScore || 0;
const drLvl = data.drLevel || "Low";
s5.addShape(pres.shapes.RECTANGLE, {
  x: 7.2, y: 0.2, w: 2.5, h: 0.75,
  fill: { color: COLORS.offWhite }, shadow: makeShadow()
});
s5.addText([
  { text: `${drTotal}`, options: { fontSize: 22, bold: true, color: drTotalColor(drTotal) } },
  { text: ` / 20`, options: { fontSize: 11, color: COLORS.medGray } },
  { text: `  ${drLvl}`, options: { fontSize: 12, bold: true, color: drTotalColor(drTotal) } },
], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: "center", valign: "middle", margin: 0 });

// Scale legend
s5.addText("Scale: 1 = Minimal pressure  |  2 = Low  |  3 = Moderate  |  4 = High  |  5 = Severe", {
  x: 0.6, y: 0.85, w: 8.8, h: 0.3,
  fontSize: 8, fontFace: "Arial", color: COLORS.medGray, italic: true
});

// Disruption scoring table (v4: 4 dimensions)
const drHeaders = [
  [
    { text: "Dimension", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
    { text: "Score", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: "center" } },
    { text: "Rationale", options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
  ]
];

const drRows = [];
const drCategories = data.disruptionRisk || {};
Object.values(drCategories).forEach((subs) => {
  Object.entries(subs).forEach(([subName, subData], idx) => {
    drRows.push([
      { text: subName, options: { bold: true, fontSize: 10, color: COLORS.navy, fill: { color: idx % 2 === 0 ? COLORS.offWhite : COLORS.white } } },
      { text: String(subData.score), options: { fontSize: 14, bold: true, color: drScoreColor(subData.score), align: "center", fill: { color: idx % 2 === 0 ? COLORS.offWhite : COLORS.white } } },
      { text: subData.rationale || "", options: { fontSize: 7.5, color: COLORS.darkGray, fill: { color: idx % 2 === 0 ? COLORS.offWhite : COLORS.white } } },
    ]);
  });
});

s5.addTable([...drHeaders, ...drRows], {
  x: 0.3, y: 1.2, w: 9.4,
  colW: [2.2, 0.7, 6.5],
  border: { pt: 0.5, color: COLORS.lightGray },
  autoPage: false,
  rowH: 0.8
});

// === SLIDE 6: Disruption Deep Dive ===
let s6 = pres.addSlide();
s6.background = { color: COLORS.white };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s6.addText("Disruption Risk: Key Findings", {
  x: 0.6, y: 0.3, w: 9, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: COLORS.navy, bold: true
});

const keyRisks = data.keyDisruptionFindings || [];
keyRisks.slice(0, 3).forEach((risk, i) => {
  const y = 1.1 + i * 1.5;
  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 8.8, h: 1.3,
    fill: { color: COLORS.offWhite }, shadow: makeShadow()
  });
  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 0.06, h: 1.3,
    fill: { color: drScoreColor(risk.severity || 3) }
  });
  s6.addText(risk.title, {
    x: 0.9, y: y + 0.05, w: 7.5, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: COLORS.navy, bold: true, margin: 0
  });
  s6.addText(risk.description, {
    x: 0.9, y: y + 0.4, w: 8.2, h: 0.8,
    fontSize: 10, fontFace: "Arial", color: COLORS.darkGray, margin: 0, lineSpacingMultiple: 1.3
  });
});

// === SLIDE 7: Traditional PE Suitability Assessment ===
let s7 = pres.addSlide();
s7.background = { color: COLORS.white };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s7.addText("Traditional PE Suitability", {
  x: 0.6, y: 0.3, w: 7, h: 0.6,
  fontSize: 24, fontFace: "Arial", color: COLORS.navy, bold: true
});

// Overall PE score callout
const peTotal = data.peTotalScore || 0;
const peLvl = data.peLevel || "Medium";
s7.addShape(pres.shapes.RECTANGLE, {
  x: 7.2, y: 0.2, w: 2.5, h: 0.75,
  fill: { color: COLORS.offWhite }, shadow: makeShadow()
});
s7.addText([
  { text: `${peTotal}`, options: { fontSize: 22, bold: true, color: peTotalColor(peTotal) } },
  { text: ` / 20`, options: { fontSize: 11, color: COLORS.medGray } },
  { text: `  ${peLvl}`, options: { fontSize: 12, bold: true, color: peTotalColor(peTotal) } },
], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: "center", valign: "middle", margin: 0 });

// Scale legend
s7.addText("Scale: 0 = Unfavorable  |  1 = Moderate  |  2 = Favorable", {
  x: 0.6, y: 0.85, w: 8.8, h: 0.3,
  fontSize: 8, fontFace: "Arial", color: COLORS.medGray, italic: true
});

// PE scoring table (10 rows + header + total = 12 rows)
const peHeaders = [
  [
    { text: "Criterion", options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: "Score", options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy }, align: "center" } },
    { text: "Metric", options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: "Rationale", options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
  ]
];

const peRows = [];
const peCategories = data.peSuitability || [];
peCategories.forEach((item, idx) => {
  const bgColor = idx % 2 === 0 ? COLORS.offWhite : COLORS.white;
  peRows.push([
    { text: item.category, options: { bold: true, fontSize: 8.5, color: COLORS.navy, fill: { color: bgColor } } },
    { text: String(item.score), options: { fontSize: 12, bold: true, color: peScoreColor(item.score), align: "center", fill: { color: bgColor } } },
    { text: item.metric || "", options: { fontSize: 7, color: COLORS.darkGray, fill: { color: bgColor } } },
    { text: item.rationale || "", options: { fontSize: 6.5, color: COLORS.darkGray, fill: { color: bgColor } } },
  ]);
});

// Totals row
peRows.push([
  { text: "TOTAL", options: { bold: true, fontSize: 9, color: COLORS.navy, fill: { color: COLORS.lightGray } } },
  { text: String(peTotal), options: { fontSize: 14, bold: true, color: peTotalColor(peTotal), align: "center", fill: { color: COLORS.lightGray } } },
  { text: `${peLvl} (${peTotal}/20)`, options: { fontSize: 9, bold: true, color: COLORS.darkGray, fill: { color: COLORS.lightGray } } },
  { text: "", options: { fill: { color: COLORS.lightGray } } },
]);

s7.addTable([...peHeaders, ...peRows], {
  x: 0.3, y: 1.15, w: 9.4,
  colW: [1.5, 0.55, 1.8, 5.55],
  border: { pt: 0.5, color: COLORS.lightGray },
  autoPage: false,
  rowH: 0.42
});

// === SLIDE 8: Overall B.AI Score with Decisioning Matrix ===
let s8 = pres.addSlide();
s8.background = { color: COLORS.darkNavy };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });

s8.addText("B.AI Assessment Summary", {
  x: 0.6, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial", color: COLORS.white, bold: true
});

const matrixClass = data.matrixClassification || "Monitor";
const cls = data.classification || "Amber";
const clsColor = classColor(matrixClass);

// 5-box layout: AI VC | Non-AI VC | AI DR | PE Suitability | Classification
const boxW = 1.72;
const boxH = 2.0;
const boxY = 1.2;
const boxGap = 0.15;
const boxStartX = 0.3;

// Box 1: AI Value Creation (v4: /55)
s8.addShape(pres.shapes.RECTANGLE, { x: boxStartX, y: boxY, w: boxW, h: boxH, fill: { color: "1F3355" }, shadow: makeShadow() });
s8.addText("AI Value\nCreation", { x: boxStartX, y: boxY + 0.1, w: boxW, h: 0.6, fontSize: 10, color: COLORS.medGray, align: "center", margin: 0 });
s8.addText(`${vcTotal}/55`, { x: boxStartX, y: boxY + 0.7, w: boxW, h: 0.7, fontSize: 28, bold: true, color: vcTotalColor(vcTotal), align: "center", margin: 0 });
s8.addText(vcLvl, { x: boxStartX, y: boxY + 1.4, w: boxW, h: 0.4, fontSize: 12, bold: true, color: vcTotalColor(vcTotal), align: "center", margin: 0 });

// Box 2: Non-AI Value Creation (v4: /55)
const vcNonAiTot = data.vcNonAiTotalScore || 0;
const vcNonAiLv = data.vcNonAiLevel || "";
const box2X = boxStartX + boxW + boxGap;
s8.addShape(pres.shapes.RECTANGLE, { x: box2X, y: boxY, w: boxW, h: boxH, fill: { color: "1F3355" }, shadow: makeShadow() });
s8.addText("Non-AI Value\nCreation", { x: box2X, y: boxY + 0.1, w: boxW, h: 0.6, fontSize: 10, color: COLORS.medGray, align: "center", margin: 0 });
s8.addText(`${vcNonAiTot}/55`, { x: box2X, y: boxY + 0.7, w: boxW, h: 0.7, fontSize: 28, bold: true, color: vcTotalColor(vcNonAiTot), align: "center", margin: 0 });
s8.addText(vcNonAiLv, { x: box2X, y: boxY + 1.4, w: boxW, h: 0.4, fontSize: 12, bold: true, color: vcTotalColor(vcNonAiTot), align: "center", margin: 0 });

// Box 3: AI Disruption Risk (v4: /20)
const box3X = box2X + boxW + boxGap;
s8.addShape(pres.shapes.RECTANGLE, { x: box3X, y: boxY, w: boxW, h: boxH, fill: { color: "1F3355" }, shadow: makeShadow() });
s8.addText("AI Disruption\nRisk", { x: box3X, y: boxY + 0.1, w: boxW, h: 0.6, fontSize: 10, color: COLORS.medGray, align: "center", margin: 0 });
s8.addText(`${drTotal}/20`, { x: box3X, y: boxY + 0.7, w: boxW, h: 0.7, fontSize: 28, bold: true, color: drTotalColor(drTotal), align: "center", margin: 0 });
s8.addText(drLvl, { x: box3X, y: boxY + 1.4, w: boxW, h: 0.4, fontSize: 12, bold: true, color: drTotalColor(drTotal), align: "center", margin: 0 });

// Box 4: PE Suitability
const box4X = box3X + boxW + boxGap;
s8.addShape(pres.shapes.RECTANGLE, { x: box4X, y: boxY, w: boxW, h: boxH, fill: { color: "1F3355" }, shadow: makeShadow() });
s8.addText("PE\nSuitability", { x: box4X, y: boxY + 0.1, w: boxW, h: 0.6, fontSize: 10, color: COLORS.medGray, align: "center", margin: 0 });
s8.addText(`${peTotal}/20`, { x: box4X, y: boxY + 0.7, w: boxW, h: 0.7, fontSize: 28, bold: true, color: peTotalColor(peTotal), align: "center", margin: 0 });
s8.addText(peLvl, { x: box4X, y: boxY + 1.4, w: boxW, h: 0.4, fontSize: 12, bold: true, color: peTotalColor(peTotal), align: "center", margin: 0 });

// Box 5: Matrix Classification
const box5X = box4X + boxW + boxGap;
const box5W = 10 - box5X - 0.3; // Fill remaining space
s8.addShape(pres.shapes.RECTANGLE, { x: box5X, y: boxY, w: box5W, h: boxH, fill: { color: "1F3355" }, shadow: makeShadow() });
s8.addText("Matrix\nClassification", { x: box5X, y: boxY + 0.1, w: box5W, h: 0.6, fontSize: 10, color: COLORS.medGray, align: "center", margin: 0 });
s8.addText(matrixClass, { x: box5X, y: boxY + 0.7, w: box5W, h: 0.7, fontSize: 22, bold: true, color: clsColor, align: "center", margin: 0 });
s8.addText(cls, { x: box5X, y: boxY + 1.4, w: box5W, h: 0.4, fontSize: 12, bold: true, color: clsColor, align: "center", margin: 0 });

// Net Assessment text
s8.addText("Net Assessment", {
  x: 0.6, y: 3.5, w: 8.8, h: 0.4,
  fontSize: 14, fontFace: "Arial", color: COLORS.gold, bold: true
});
s8.addText(data.netAssessment || "", {
  x: 0.6, y: 3.9, w: 8.8, h: 1.4,
  fontSize: 11, fontFace: "Arial", color: COLORS.white, lineSpacingMultiple: 1.4
});

// Data availability footnote
const proxyCount = data.dataAvailabilityNote?.proxyCount || 0;
if (proxyCount > 0) {
  s8.addText(`Note: ${proxyCount} score(s) rely on public proxy data — see report for details.`, {
    x: 0.5, y: 5.35, w: 9, h: 0.2,
    fontSize: 7, fontFace: "Arial", color: COLORS.medGray, italic: true
  });
}

// Write file
pres.writeFile({ fileName: outputPath })
  .then(() => console.log(`Presentation saved to: ${outputPath}`))
  .catch(err => console.error("Error:", err));
