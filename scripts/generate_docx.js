/**
 * Brightstar.AI B.AI Screening Assessment - DOCX Report Generator (v4)
 *
 * Usage: node generate_docx.js <scoring_data.json> <output_path.docx>
 *
 * Aligned with Brightstar Screening AI & Tech Criteria v4:
 * - Value Creation: 7 categories in 3 tiers (1-5 each, Tier 3 weighted 3×, total 11-55)
 * - Disruption Risk: 4 dimensions (1-5 each, total 4-20)
 * - PE Suitability: 10 criteria (0-2 each, total 0-20)
 * - Decisioning Matrix: Pursue / Monitor / Avoid
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents
} = require("docx");

// Read scoring data
const dataPath = process.argv[2] || "scoring_data.json";
const outputPath = process.argv[3] || "BAI_Screening_Report.docx";
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Colors
const NAVY = "1A2B4A";
const TEAL = "0891B2";
const GOLD = "D4A843";
const DARK_GRAY = "374151";
const MED_GRAY = "9CA3AF";
const LIGHT_GRAY = "F3F4F6";
const GREEN = "059669";
const AMBER = "D97706";
const RED = "DC2626";

function vcScoreColorHex(score) {
  if (score >= 4) return GREEN;
  if (score >= 3) return GOLD;
  return RED;
}

// v4: 11-55 scale (Tier 3 weighted 3×)
function vcTotalColorHex(total) {
  if (total >= 41) return GREEN;
  if (total >= 26) return GOLD;
  return RED;
}

function drScoreColorHex(score) {
  if (score <= 2) return GREEN;
  if (score <= 3) return GOLD;
  return RED;
}

// v4: 4-20 scale
function drTotalColorHex(total) {
  if (total <= 9) return GREEN;
  if (total <= 14) return GOLD;
  return RED;
}

function peScoreColorHex(score) {
  if (score >= 2) return GREEN;
  if (score >= 1) return GOLD;
  return RED;
}

function peTotalColorHex(total) {
  if (total >= 14) return GREEN;
  if (total >= 7) return GOLD;
  return RED;
}

// Border helper
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Cell helper
function cell(text, opts = {}) {
  const {
    bold = false, color = DARK_GRAY, fill = "FFFFFF", width = 2000,
    align = AlignmentType.LEFT, fontSize = 20, colspan = 1
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: cellMargins,
    columnSpan: colspan,
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold, color, size: fontSize, font: "Arial" })],
      }),
    ],
  });
}

// Build VC scoring table rows (AI + Non-AI + Tier)
function buildVCRows(categories) {
  const rows = [];
  Object.values(categories).forEach((subs) => {
    Object.entries(subs).forEach(([subName, subData]) => {
      const score = subData.score;
      const nonAi = subData.nonAiScore != null ? subData.nonAiScore : "-";
      const tier = subData.tier || "";
      rows.push(
        new TableRow({
          children: [
            cell(tier, { width: 1200, fontSize: 16, color: MED_GRAY }),
            cell(subName, { bold: true, width: 1400 }),
            cell(String(score), { bold: true, color: vcScoreColorHex(score), width: 600, align: AlignmentType.CENTER }),
            cell(String(nonAi), { bold: true, color: typeof nonAi === "number" ? vcScoreColorHex(nonAi) : MED_GRAY, width: 700, align: AlignmentType.CENTER }),
            cell(subData.confidence || "Medium", { width: 800, align: AlignmentType.CENTER }),
            cell(subData.rationale || "", { width: 4660, fontSize: 18 }),
          ],
        })
      );
    });
  });
  return rows;
}

// Build DR scoring table rows
function buildDRRows(categories) {
  const rows = [];
  Object.values(categories).forEach((subs) => {
    Object.entries(subs).forEach(([subName, subData]) => {
      const score = subData.score;
      rows.push(
        new TableRow({
          children: [
            cell(subName, { bold: true, width: 2000 }),
            cell(String(score), { bold: true, color: drScoreColorHex(score), width: 800, align: AlignmentType.CENTER }),
            cell(subData.confidence || "Medium", { width: 1000, align: AlignmentType.CENTER }),
            cell(subData.rationale || "", { width: 5560, fontSize: 18 }),
          ],
        })
      );
    });
  });
  return rows;
}

// Build PE suitability scoring table rows
function buildPERows(categories) {
  const rows = [];
  (categories || []).forEach((item) => {
    rows.push(
      new TableRow({
        children: [
          cell(item.category, { bold: true, width: 1600 }),
          cell(String(item.score), { bold: true, color: peScoreColorHex(item.score), width: 600, align: AlignmentType.CENTER }),
          cell(item.metric || "", { width: 1800, fontSize: 18 }),
          cell(item.confidence || "Medium", { width: 900, align: AlignmentType.CENTER }),
          cell(item.rationale || "", { width: 4460, fontSize: 18 }),
        ],
      })
    );
  });
  return rows;
}

// Build the document
async function buildDocument() {
  const vcTotal = data.vcTotalScore || 0;
  const drTotal = data.drTotalScore || 0;
  const matrixClass = data.matrixClassification || "Monitor";
  const cls = data.classification || "Amber";

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, color: NAVY, font: "Arial" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, color: NAVY, font: "Arial" },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, color: TEAL, font: "Arial" },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
        {
          reference: "numbers",
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD, space: 4 } },
                children: [
                  new TextRun({ text: "BRIGHTSTAR.AI  |  ", color: GOLD, size: 16, font: "Arial", bold: true }),
                  new TextRun({ text: "B.AI Screening Assessment  |  CONFIDENTIAL", color: MED_GRAY, size: 16, font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", color: MED_GRAY, size: 16, font: "Arial" }),
                  new TextRun({ children: [PageNumber.CURRENT], color: MED_GRAY, size: 16, font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title page
          new Paragraph({ spacing: { before: 2400 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "BRIGHTSTAR.AI", size: 28, color: GOLD, bold: true, font: "Arial", characterSpacing: 200 })],
          }),
          new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: data.companyName.toUpperCase(), size: 56, color: NAVY, bold: true, font: "Arial" })],
          }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "B.AI Screening Assessment", size: 32, color: TEAL, font: "Arial" })],
          }),
          new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: `${data.sector}  |  ${data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
              size: 22, color: MED_GRAY, font: "Arial"
            })],
          }),
          new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "CONFIDENTIAL", size: 18, color: MED_GRAY, italic: true, font: "Arial" })],
          }),

          // Table of Contents
          new Paragraph({ children: [new PageBreak()] }),
          new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),

          // Executive Summary
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: data.executiveSummary || "", color: DARK_GRAY, size: 22 })],
          }),

          // Overall Score Summary Box (5 columns, v4 scores)
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1872, 1872, 1872, 1872, 1872],
            rows: [
              new TableRow({
                children: [
                  cell("AI Value Creation", { bold: true, fill: NAVY, color: "FFFFFF", width: 1872, align: AlignmentType.CENTER, fontSize: 18 }),
                  cell("Non-AI Value Creation", { bold: true, fill: NAVY, color: "FFFFFF", width: 1872, align: AlignmentType.CENTER, fontSize: 18 }),
                  cell("AI Disruption Risk", { bold: true, fill: NAVY, color: "FFFFFF", width: 1872, align: AlignmentType.CENTER, fontSize: 18 }),
                  cell("PE Suitability", { bold: true, fill: NAVY, color: "FFFFFF", width: 1872, align: AlignmentType.CENTER, fontSize: 18 }),
                  cell("Classification", { bold: true, fill: NAVY, color: "FFFFFF", width: 1872, align: AlignmentType.CENTER, fontSize: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  cell(`${vcTotal}/55 (${data.vcLevel || ""})`, { bold: true, color: vcTotalColorHex(vcTotal), width: 1872, align: AlignmentType.CENTER, fontSize: 22 }),
                  cell(`${data.vcNonAiTotalScore || 0}/55 (${data.vcNonAiLevel || ""})`, { bold: true, color: vcTotalColorHex(data.vcNonAiTotalScore || 0), width: 1872, align: AlignmentType.CENTER, fontSize: 22 }),
                  cell(`${drTotal}/20 (${data.drLevel || ""})`, { bold: true, color: drTotalColorHex(drTotal), width: 1872, align: AlignmentType.CENTER, fontSize: 22 }),
                  cell(`${data.peTotalScore || 0}/20 (${data.peLevel || ""})`, { bold: true, color: peTotalColorHex(data.peTotalScore || 0), width: 1872, align: AlignmentType.CENTER, fontSize: 22 }),
                  cell(`${matrixClass} (${cls})`, { bold: true, color: vcTotalColorHex(vcTotal), width: 1872, align: AlignmentType.CENTER, fontSize: 22 }),
                ],
              }),
            ],
          }),

          // Company Overview
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Company Overview")] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: data.companyOverview || data.businessDescription || "", color: DARK_GRAY })],
          }),

          // Value Creation Analysis (v4: 7 categories, Tier 3 weighted 3×, 11-55)
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("AI Value Creation Potential Analysis")] }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `Total Score: ${vcTotal} / 35`, bold: true, color: vcTotalColorHex(vcTotal), size: 28 }),
              new TextRun({ text: `  (${data.vcLevel || ""})`, bold: true, color: vcTotalColorHex(vcTotal), size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: "Scale: 1 = Minimal (<1pp EBITDA)  |  2 = Low (1-3pp)  |  3 = Moderate (3-5pp)  |  4 = High (5-8pp)  |  5 = Transformative (>8pp)  |  Half-points allowed", color: MED_GRAY, italic: true, size: 18 })],
          }),

          // Value Creation Scoring Table (v4: with Tier column)
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1200, 1400, 600, 700, 800, 4660],
            rows: [
              new TableRow({
                children: [
                  cell("Tier", { bold: true, fill: NAVY, color: "FFFFFF", width: 1200 }),
                  cell("Category", { bold: true, fill: NAVY, color: "FFFFFF", width: 1400 }),
                  cell("AI", { bold: true, fill: NAVY, color: "FFFFFF", width: 600, align: AlignmentType.CENTER }),
                  cell("Non-AI", { bold: true, fill: NAVY, color: "FFFFFF", width: 700, align: AlignmentType.CENTER }),
                  cell("Confidence", { bold: true, fill: NAVY, color: "FFFFFF", width: 800, align: AlignmentType.CENTER }),
                  cell("Rationale", { bold: true, fill: NAVY, color: "FFFFFF", width: 4660 }),
                ],
              }),
              ...buildVCRows(data.valueCreation || {}),
            ],
          }),

          // Detailed VC commentary
          ...(data.vcDetailedCommentary || []).flatMap(section => [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(section.title)] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: section.text, color: DARK_GRAY })] }),
          ]),

          // Disruption Risk Analysis (v4: 4 dimensions, 4-20)
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("AI Disruption Risk Assessment")] }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `Total Score: ${drTotal} / 20`, bold: true, color: drTotalColorHex(drTotal), size: 28 }),
              new TextRun({ text: `  (${data.drLevel || ""})`, bold: true, color: drTotalColorHex(drTotal), size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: "Scale: 1 = Minimal pressure  |  2 = Low  |  3 = Moderate  |  4 = High  |  5 = Severe", color: MED_GRAY, italic: true, size: 18 })],
          }),

          // Disruption Risk Scoring Table
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [2000, 800, 1000, 5560],
            rows: [
              new TableRow({
                children: [
                  cell("Dimension", { bold: true, fill: NAVY, color: "FFFFFF", width: 2000 }),
                  cell("Score", { bold: true, fill: NAVY, color: "FFFFFF", width: 800, align: AlignmentType.CENTER }),
                  cell("Confidence", { bold: true, fill: NAVY, color: "FFFFFF", width: 1000, align: AlignmentType.CENTER }),
                  cell("Rationale", { bold: true, fill: NAVY, color: "FFFFFF", width: 5560 }),
                ],
              }),
              ...buildDRRows(data.disruptionRisk || {}),
            ],
          }),

          // Detailed DR commentary
          ...(data.drDetailedCommentary || []).flatMap(section => [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(section.title)] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: section.text, color: DARK_GRAY })] }),
          ]),

          // PE Suitability Assessment (unchanged)
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Traditional PE Suitability Assessment")] }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `Total Score: ${data.peTotalScore || 0} / 20`, bold: true, color: peTotalColorHex(data.peTotalScore || 0), size: 28 }),
              new TextRun({ text: `  (${data.peLevel || ""})`, bold: true, color: peTotalColorHex(data.peTotalScore || 0), size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: "Scale: 0 = Unfavorable  |  1 = Moderate  |  2 = Favorable", color: MED_GRAY, italic: true, size: 18 })],
          }),

          // PE Scoring Table
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [1600, 600, 1800, 900, 4460],
            rows: [
              new TableRow({
                children: [
                  cell("Criterion", { bold: true, fill: NAVY, color: "FFFFFF", width: 1600 }),
                  cell("Score", { bold: true, fill: NAVY, color: "FFFFFF", width: 600, align: AlignmentType.CENTER }),
                  cell("Metric", { bold: true, fill: NAVY, color: "FFFFFF", width: 1800 }),
                  cell("Confidence", { bold: true, fill: NAVY, color: "FFFFFF", width: 900, align: AlignmentType.CENTER }),
                  cell("Rationale", { bold: true, fill: NAVY, color: "FFFFFF", width: 4460 }),
                ],
              }),
              ...buildPERows(data.peSuitability || []),
            ],
          }),

          // Detailed PE commentary
          ...(data.peDetailedCommentary || []).flatMap(section => [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(section.title)] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: section.text, color: DARK_GRAY })] }),
          ]),

          // Net Assessment
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Overall B.AI Score & Net Assessment")] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: data.netAssessment || "", color: DARK_GRAY })],
          }),

          // Sources & Methodology (v4 updated)
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Sources & Methodology")] }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Methodology")] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({
              text: "This assessment was conducted using the Brightstar.AI B.AI Scoring Framework v4, aligned with the Brightstar Screening AI & Tech Criteria. Value Creation Potential is evaluated across 7 categories in 3 tiers — Cost Optimization (Customer Service, Internal Software Development, Back Office, Supply Chain), Revenue Optimization (Sales & Marketing), and Revenue Transformation (Customer Lifetime Value, New Products/Services) — each scored 1-5 for both AI-specific and non-AI (traditional PE) value creation potential. Tier 3 (Revenue Transformation) categories carry a 3× weight multiplier, giving a weighted total range of 11-55. Disruption Risk is assessed across 4 dimensions (Business Model Disruption, Value Chain Disruption, New AI-Native Products/Services, New AI-Native Entrants), each scored 1-5, totaling 4-20. Traditional PE Suitability is evaluated across 10 criteria (Growth Rate, Cyclicality, Capital Intensity, EBITDA Margin, Cash Generation, Binary Outcomes, Value Chain Position, Dominant Competitor, Market Fragmentation, Customer Concentration), each scored 0-2, totaling 0-20. The AI pillars are combined in a decisioning matrix: Pursue (Green), Monitor (Amber), or Avoid (Red).",
              color: DARK_GRAY
            })],
          }),
          // Data availability note
          ...(data.dataAvailabilityNote && data.dataAvailabilityNote.proxyCount > 0 ? [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Data Availability")] }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({
                text: `${data.dataAvailabilityNote.proxyCount} score(s) in this assessment rely on public proxy data rather than company-specific DD materials. ${data.dataAvailabilityNote.estimatedConfidenceImpact || ""}`,
                color: DARK_GRAY, italic: true
              })],
            }),
            ...(data.dataAvailabilityNote.categoriesWithProxy || []).map(item =>
              new Paragraph({
                numbering: { reference: "bullets", level: 0 },
                children: [
                  new TextRun({ text: `${item.category}: `, bold: true, color: DARK_GRAY, size: 20 }),
                  new TextRun({ text: `${item.reason}. Proxy: ${item.proxyUsed}`, color: DARK_GRAY, size: 20 }),
                ],
              })
            ),
          ] : []),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Sources")] }),
          ...(data.sources || []).map(source =>
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              children: [new TextRun({ text: source, color: DARK_GRAY, size: 20 })],
            })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Report saved to: ${outputPath}`);
}

buildDocument().catch(err => console.error("Error:", err));
