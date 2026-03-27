/**
 * Generates PPTX and DOCX reports from ScoringData and uploads to Supabase Storage.
 * Adapted from scripts/generate_pptx.js and scripts/generate_docx.js
 */

import { ScoringData } from './types';
import { createClient } from '@supabase/supabase-js';

// Lazy imports to avoid bundling issues in client code
async function getPptxGen() {
  const mod = await import('pptxgenjs');
  return mod.default;
}

async function getDocx() {
  return await import('docx');
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

// ─── Colors ───
const COLORS = {
  navy: "1A2B4A", darkNavy: "0F1B2D", teal: "0891B2", gold: "D4A843",
  white: "FFFFFF", offWhite: "F5F5F5", lightGray: "E5E7EB", medGray: "9CA3AF",
  darkGray: "374151", green: "059669", amber: "D97706", red: "DC2626",
};

function vcScoreColor(score: number) { return score >= 4 ? COLORS.green : score >= 3 ? COLORS.gold : COLORS.red; }
function vcTotalColor(total: number) { return total >= 41 ? COLORS.green : total >= 26 ? COLORS.gold : COLORS.red; }
function drScoreColor(score: number) { return score <= 2 ? COLORS.green : score <= 3 ? COLORS.gold : COLORS.red; }
function drTotalColor(total: number) { return total <= 9 ? COLORS.green : total <= 14 ? COLORS.gold : COLORS.red; }
function peScoreColor(score: number) { return score >= 2 ? COLORS.green : score >= 1 ? COLORS.gold : COLORS.red; }
function peTotalColor(total: number) { return total >= 14 ? COLORS.green : total >= 7 ? COLORS.gold : COLORS.red; }
function classColor(c: string) { return c === 'Pursue' ? COLORS.green : c === 'Avoid' ? COLORS.red : COLORS.amber; }
function tierColor(t: string) { return t === 'Revenue Transformation' ? COLORS.teal : t === 'Revenue Optimization' ? COLORS.gold : COLORS.navy; }

// ─── PPTX Generation ───
async function generatePptxBuffer(data: ScoringData): Promise<Buffer> {
  const PptxGenJS = await getPptxGen();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pres = new PptxGenJS() as any;
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Brightstar.AI';
  pres.title = `B.AI Screening: ${data.companyName}`;

  const makeShadow = (): Record<string, unknown> => ({ type: 'outer', color: '000000', blur: 4, offset: 2, angle: 135, opacity: 0.1 });

  // SLIDE 1: Title
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.darkNavy };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s1.addText('BRIGHTSTAR.AI', { x: 0.8, y: 1.2, w: 8.4, h: 0.5, fontSize: 14, fontFace: 'Arial', color: COLORS.gold, charSpacing: 6, bold: true });
  s1.addText(data.companyName.toUpperCase(), { x: 0.8, y: 1.9, w: 8.4, h: 1.0, fontSize: 40, fontFace: 'Arial', color: COLORS.white, bold: true });
  s1.addText('B.AI Screening Assessment', { x: 0.8, y: 2.9, w: 8.4, h: 0.6, fontSize: 22, fontFace: 'Arial', color: COLORS.teal });
  s1.addText(`${data.sector}  |  ${data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { x: 0.8, y: 3.6, w: 8.4, h: 0.4, fontSize: 13, fontFace: 'Arial', color: COLORS.medGray });
  s1.addText('CONFIDENTIAL', { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 10, fontFace: 'Arial', color: COLORS.medGray, italics: true });

  // SLIDE 2: Company Overview
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.white };
  s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s2.addText('Company Overview', { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 28, fontFace: 'Arial', color: COLORS.navy, bold: true });

  const metrics = data.keyMetrics || [];
  metrics.slice(0, 4).forEach((m, i) => {
    const x = 0.6 + i * 2.25;
    s2.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.0, h: 1.1, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
    s2.addText(m.value, { x, y: 1.15, w: 2.0, h: 0.6, fontSize: 22, fontFace: 'Arial', color: COLORS.navy, bold: true, align: 'center', margin: 0 });
    s2.addText(m.label, { x, y: 1.7, w: 2.0, h: 0.4, fontSize: 10, fontFace: 'Arial', color: COLORS.medGray, align: 'center', margin: 0 });
  });
  s2.addText(data.businessDescription || '', { x: 0.6, y: 2.5, w: 8.8, h: 2.8, fontSize: 12, fontFace: 'Arial', color: COLORS.darkGray, lineSpacingMultiple: 1.4 });

  // SLIDE 3: VC Scoring
  const s3 = pres.addSlide();
  s3.background = { color: COLORS.white };
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s3.addText('AI Value Creation Potential', { x: 0.6, y: 0.3, w: 7, h: 0.6, fontSize: 24, fontFace: 'Arial', color: COLORS.navy, bold: true });

  const vcTotal = data.vcTotalScore || 0;
  s3.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 0.2, w: 2.5, h: 0.75, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
  s3.addText([
    { text: `${vcTotal}`, options: { fontSize: 22, bold: true, color: vcTotalColor(vcTotal) } },
    { text: ' / 55', options: { fontSize: 11, color: COLORS.medGray } },
    { text: `  ${data.vcLevel || ''}`, options: { fontSize: 12, bold: true, color: vcTotalColor(vcTotal) } },
  ], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: 'center', valign: 'middle', margin: 0 });

  // VC table
  const vcHeaders = [[
    { text: 'Tier', options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: 'Category', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
    { text: 'AI', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: 'center' } },
    { text: 'Non-AI', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: 'center' } },
    { text: 'Rationale (AI)', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
  ]];

  const vcRows: Record<string, unknown>[][] = [];
  const vcCats = data.valueCreation || {};
  Object.values(vcCats).forEach((subs: Record<string, Record<string, unknown>>) => {
    Object.entries(subs).forEach(([name, sub], idx) => {
      const bg = idx % 2 === 0 ? COLORS.offWhite : COLORS.white;
      const nonAi = sub.nonAiScore != null ? sub.nonAiScore : '-';
      vcRows.push([
        { text: (sub.tier as string) || '', options: { fontSize: 7.5, italics: true, color: tierColor((sub.tier as string) || ''), fill: { color: bg } } },
        { text: name, options: { bold: true, fontSize: 10, color: COLORS.navy, fill: { color: bg } } },
        { text: String(sub.score), options: { fontSize: 14, bold: true, color: vcScoreColor(sub.score as number), align: 'center', fill: { color: bg } } },
        { text: String(nonAi), options: { fontSize: 14, bold: true, color: vcScoreColor(typeof nonAi === 'number' ? nonAi : 0), align: 'center', fill: { color: bg } } },
        { text: (sub.rationale as string) || '', options: { fontSize: 7.5, color: COLORS.darkGray, fill: { color: bg } } },
      ]);
    });
  });

  s3.addTable([...vcHeaders, ...vcRows], { x: 0.2, y: 1.2, w: 9.6, colW: [1.2, 1.5, 0.5, 0.6, 5.8], border: { pt: 0.5, color: COLORS.lightGray }, autoPage: false, rowH: 0.5 });

  // SLIDE 4: Opportunities
  const s4 = pres.addSlide();
  s4.background = { color: COLORS.white };
  s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s4.addText('Value Creation: Key AI Opportunities', { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 24, fontFace: 'Arial', color: COLORS.navy, bold: true });
  (data.topOpportunities || []).slice(0, 3).forEach((opp, i) => {
    const y = 1.1 + i * 1.5;
    s4.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 1.3, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
    s4.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.06, h: 1.3, fill: { color: COLORS.teal } });
    s4.addText(opp.title, { x: 0.9, y: y + 0.05, w: 6, h: 0.35, fontSize: 13, fontFace: 'Arial', color: COLORS.navy, bold: true, margin: 0 });
    s4.addText(opp.description, { x: 0.9, y: y + 0.4, w: 8.2, h: 0.8, fontSize: 10, fontFace: 'Arial', color: COLORS.darkGray, margin: 0, lineSpacingMultiple: 1.3 });
  });

  // SLIDE 5: DR Scoring
  const s5 = pres.addSlide();
  s5.background = { color: COLORS.white };
  s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s5.addText('AI Disruption Risk Assessment', { x: 0.6, y: 0.3, w: 7, h: 0.6, fontSize: 24, fontFace: 'Arial', color: COLORS.navy, bold: true });

  const drTotal = data.drTotalScore || 0;
  s5.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 0.2, w: 2.5, h: 0.75, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
  s5.addText([
    { text: `${drTotal}`, options: { fontSize: 22, bold: true, color: drTotalColor(drTotal) } },
    { text: ' / 20', options: { fontSize: 11, color: COLORS.medGray } },
    { text: `  ${data.drLevel || ''}`, options: { fontSize: 12, bold: true, color: drTotalColor(drTotal) } },
  ], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: 'center', valign: 'middle', margin: 0 });

  const drHeaders = [[
    { text: 'Dimension', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
    { text: 'Score', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy }, align: 'center' } },
    { text: 'Rationale', options: { bold: true, color: COLORS.white, fontSize: 10, fill: { color: COLORS.navy } } },
  ]];
  const drRows: Record<string, unknown>[][] = [];
  const drCats = data.disruptionRisk || {};
  Object.values(drCats).forEach((subs: Record<string, Record<string, unknown>>) => {
    Object.entries(subs).forEach(([name, sub], idx) => {
      const bg = idx % 2 === 0 ? COLORS.offWhite : COLORS.white;
      drRows.push([
        { text: name, options: { bold: true, fontSize: 10, color: COLORS.navy, fill: { color: bg } } },
        { text: String(sub.score), options: { fontSize: 14, bold: true, color: drScoreColor(sub.score as number), align: 'center', fill: { color: bg } } },
        { text: (sub.rationale as string) || '', options: { fontSize: 7.5, color: COLORS.darkGray, fill: { color: bg } } },
      ]);
    });
  });
  s5.addTable([...drHeaders, ...drRows], { x: 0.3, y: 1.2, w: 9.4, colW: [2.2, 0.7, 6.5], border: { pt: 0.5, color: COLORS.lightGray }, autoPage: false, rowH: 0.8 });

  // SLIDE 6: Disruption Findings
  const s6 = pres.addSlide();
  s6.background = { color: COLORS.white };
  s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s6.addText('Disruption Risk: Key Findings', { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 24, fontFace: 'Arial', color: COLORS.navy, bold: true });
  (data.keyDisruptionFindings || []).slice(0, 3).forEach((risk, i) => {
    const y = 1.1 + i * 1.5;
    s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 1.3, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
    s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.06, h: 1.3, fill: { color: drScoreColor(risk.severity || 3) } });
    s6.addText(risk.title, { x: 0.9, y: y + 0.05, w: 7.5, h: 0.35, fontSize: 13, fontFace: 'Arial', color: COLORS.navy, bold: true, margin: 0 });
    s6.addText(risk.description, { x: 0.9, y: y + 0.4, w: 8.2, h: 0.8, fontSize: 10, fontFace: 'Arial', color: COLORS.darkGray, margin: 0, lineSpacingMultiple: 1.3 });
  });

  // SLIDE 7: PE Suitability
  const s7 = pres.addSlide();
  s7.background = { color: COLORS.white };
  s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s7.addText('Traditional PE Suitability', { x: 0.6, y: 0.3, w: 7, h: 0.6, fontSize: 24, fontFace: 'Arial', color: COLORS.navy, bold: true });

  const peTotal = data.peTotalScore || 0;
  s7.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 0.2, w: 2.5, h: 0.75, fill: { color: COLORS.offWhite }, shadow: makeShadow() });
  s7.addText([
    { text: `${peTotal}`, options: { fontSize: 22, bold: true, color: peTotalColor(peTotal) } },
    { text: ' / 20', options: { fontSize: 11, color: COLORS.medGray } },
    { text: `  ${data.peLevel || ''}`, options: { fontSize: 12, bold: true, color: peTotalColor(peTotal) } },
  ], { x: 7.2, y: 0.2, w: 2.5, h: 0.75, align: 'center', valign: 'middle', margin: 0 });

  const peHeaders = [[
    { text: 'Criterion', options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: 'Score', options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy }, align: 'center' } },
    { text: 'Metric', options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
    { text: 'Rationale', options: { bold: true, color: COLORS.white, fontSize: 9, fill: { color: COLORS.navy } } },
  ]];
  const peRows: Record<string, unknown>[][] = [];
  (data.peSuitability || []).forEach((item, idx) => {
    const bg = idx % 2 === 0 ? COLORS.offWhite : COLORS.white;
    peRows.push([
      { text: item.category, options: { bold: true, fontSize: 8.5, color: COLORS.navy, fill: { color: bg } } },
      { text: String(item.score), options: { fontSize: 12, bold: true, color: peScoreColor(item.score), align: 'center', fill: { color: bg } } },
      { text: item.metric || '', options: { fontSize: 7, color: COLORS.darkGray, fill: { color: bg } } },
      { text: item.rationale || '', options: { fontSize: 6.5, color: COLORS.darkGray, fill: { color: bg } } },
    ]);
  });
  s7.addTable([...peHeaders, ...peRows], { x: 0.3, y: 1.15, w: 9.4, colW: [1.5, 0.55, 1.8, 5.55], border: { pt: 0.5, color: COLORS.lightGray }, autoPage: false, rowH: 0.42 });

  // SLIDE 8: Summary
  const s8 = pres.addSlide();
  s8.background = { color: COLORS.darkNavy };
  s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COLORS.gold } });
  s8.addText('B.AI Assessment Summary', { x: 0.6, y: 0.3, w: 9, h: 0.6, fontSize: 28, fontFace: 'Arial', color: COLORS.white, bold: true });

  const matrixClass = data.matrixClassification || 'Monitor';
  const clsColor = classColor(matrixClass);
  const boxW = 1.72, boxH = 2.0, boxY = 1.2, boxGap = 0.15, boxStartX = 0.3;

  // 5 summary boxes
  const boxes = [
    { label: 'AI Value\nCreation', value: `${vcTotal}/55`, level: data.vcLevel || '', colorFn: vcTotalColor, score: vcTotal },
    { label: 'Non-AI Value\nCreation', value: `${data.vcNonAiTotalScore || 0}/55`, level: data.vcNonAiLevel || '', colorFn: vcTotalColor, score: data.vcNonAiTotalScore || 0 },
    { label: 'AI Disruption\nRisk', value: `${drTotal}/20`, level: data.drLevel || '', colorFn: drTotalColor, score: drTotal },
    { label: 'PE\nSuitability', value: `${peTotal}/20`, level: data.peLevel || '', colorFn: peTotalColor, score: peTotal },
  ];
  boxes.forEach((box, i) => {
    const x = boxStartX + i * (boxW + boxGap);
    s8.addShape(pres.shapes.RECTANGLE, { x, y: boxY, w: boxW, h: boxH, fill: { color: '1F3355' }, shadow: makeShadow() });
    s8.addText(box.label, { x, y: boxY + 0.1, w: boxW, h: 0.6, fontSize: 10, color: COLORS.medGray, align: 'center', margin: 0 });
    s8.addText(box.value, { x, y: boxY + 0.7, w: boxW, h: 0.7, fontSize: 28, bold: true, color: box.colorFn(box.score), align: 'center', margin: 0 });
    s8.addText(box.level, { x, y: boxY + 1.4, w: boxW, h: 0.4, fontSize: 12, bold: true, color: box.colorFn(box.score), align: 'center', margin: 0 });
  });

  // Classification box
  const box5X = boxStartX + 4 * (boxW + boxGap);
  const box5W = 10 - box5X - 0.3;
  s8.addShape(pres.shapes.RECTANGLE, { x: box5X, y: boxY, w: box5W, h: boxH, fill: { color: '1F3355' }, shadow: makeShadow() });
  s8.addText('Matrix\nClassification', { x: box5X, y: boxY + 0.1, w: box5W, h: 0.6, fontSize: 10, color: COLORS.medGray, align: 'center', margin: 0 });
  s8.addText(matrixClass, { x: box5X, y: boxY + 0.7, w: box5W, h: 0.7, fontSize: 22, bold: true, color: clsColor, align: 'center', margin: 0 });

  s8.addText('Net Assessment', { x: 0.6, y: 3.5, w: 8.8, h: 0.4, fontSize: 14, fontFace: 'Arial', color: COLORS.gold, bold: true });
  s8.addText(data.netAssessment || '', { x: 0.6, y: 3.9, w: 8.8, h: 1.4, fontSize: 11, fontFace: 'Arial', color: COLORS.white, lineSpacingMultiple: 1.4 });

  return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
}

// ─── DOCX Generation ───
async function generateDocxBuffer(data: ScoringData): Promise<Buffer> {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
    ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents
  } = await getDocx();

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' };
  const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeCell(text: string, opts: { bold?: boolean; color?: string; fill?: string; width?: number; align?: any; fontSize?: number; colspan?: number } = {}) {
    const { bold = false, color = COLORS.darkGray, fill = 'FFFFFF', width = 2000, align = AlignmentType.LEFT, fontSize = 20, colspan = 1 } = opts;
    return new TableCell({
      borders, width: { size: width, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR }, margins: cellMargins, columnSpan: colspan,
      children: [new Paragraph({ alignment: align, children: [new TextRun({ text, bold, color, size: fontSize, font: 'Arial' })] })],
    });
  }

  const vcTotal = data.vcTotalScore || 0;
  const drTotal = data.drTotalScore || 0;

  // Build VC rows
  const vcTableRows: InstanceType<typeof TableRow>[] = [];
  Object.values(data.valueCreation || {}).forEach((subs: Record<string, Record<string, unknown>>) => {
    Object.entries(subs).forEach(([name, sub]) => {
      const nonAi = sub.nonAiScore != null ? sub.nonAiScore : '-';
      vcTableRows.push(new TableRow({
        children: [
          makeCell((sub.tier as string) || '', { width: 1200, fontSize: 16, color: COLORS.medGray }),
          makeCell(name, { bold: true, width: 1400 }),
          makeCell(String(sub.score), { bold: true, color: vcScoreColor(sub.score as number), width: 600, align: AlignmentType.CENTER }),
          makeCell(String(nonAi), { bold: true, color: typeof nonAi === 'number' ? vcScoreColor(nonAi) : COLORS.medGray, width: 700, align: AlignmentType.CENTER }),
          makeCell((sub.rationale as string) || '', { width: 5060, fontSize: 18 }),
        ],
      }));
    });
  });

  // Build DR rows
  const drTableRows: InstanceType<typeof TableRow>[] = [];
  Object.values(data.disruptionRisk || {}).forEach((subs: Record<string, Record<string, unknown>>) => {
    Object.entries(subs).forEach(([name, sub]) => {
      drTableRows.push(new TableRow({
        children: [
          makeCell(name, { bold: true, width: 2000 }),
          makeCell(String(sub.score), { bold: true, color: drScoreColor(sub.score as number), width: 800, align: AlignmentType.CENTER }),
          makeCell((sub.rationale as string) || '', { width: 6560, fontSize: 18 }),
        ],
      }));
    });
  });

  // Build PE rows
  const peTableRows: InstanceType<typeof TableRow>[] = [];
  (data.peSuitability || []).forEach((item) => {
    peTableRows.push(new TableRow({
      children: [
        makeCell(item.category, { bold: true, width: 1600 }),
        makeCell(String(item.score), { bold: true, color: peScoreColor(item.score), width: 600, align: AlignmentType.CENTER }),
        makeCell(item.metric || '', { width: 1800, fontSize: 18 }),
        makeCell(item.rationale || '', { width: 5360, fontSize: 18 }),
      ],
    }));
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, color: COLORS.navy, font: 'Arial' }, paragraph: { spacing: { before: 360, after: 200 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, color: COLORS.navy, font: 'Arial' }, paragraph: { spacing: { before: 240, after: 160 } } },
      ],
    },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'BRIGHTSTAR.AI  |  B.AI Screening Assessment  |  CONFIDENTIAL', color: COLORS.medGray, size: 16, font: 'Arial' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Page ', color: COLORS.medGray, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: COLORS.medGray, size: 16 })] })] }) },
      children: [
        // Title
        new Paragraph({ spacing: { before: 2400 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BRIGHTSTAR.AI', size: 28, color: COLORS.gold, bold: true, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.companyName.toUpperCase(), size: 56, color: COLORS.navy, bold: true, font: 'Arial' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'B.AI Screening Assessment', size: 32, color: COLORS.teal, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${data.sector}  |  ${data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 22, color: COLORS.medGray })] }),
        new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CONFIDENTIAL', size: 18, color: COLORS.medGray, italics: true })] }),

        // TOC
        new Paragraph({ children: [new PageBreak()] }),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),

        // Company Overview
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Company Overview')] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.businessDescription || '', color: COLORS.darkGray })] }),

        // VC Analysis
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('AI Value Creation Potential Analysis')] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Total Score: ${vcTotal} / 55`, bold: true, color: vcTotalColor(vcTotal), size: 28 }), new TextRun({ text: `  (${data.vcLevel || ''})`, bold: true, color: vcTotalColor(vcTotal), size: 24 })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 1400, 600, 700, 5060], rows: [
          new TableRow({ children: [
            makeCell('Tier', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 1200 }),
            makeCell('Category', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 1400 }),
            makeCell('AI', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 600, align: AlignmentType.CENTER }),
            makeCell('Non-AI', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 700, align: AlignmentType.CENTER }),
            makeCell('Rationale', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 5060 }),
          ] }),
          ...vcTableRows,
        ] }),

        // DR Analysis
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('AI Disruption Risk Assessment')] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Total Score: ${drTotal} / 20`, bold: true, color: drTotalColor(drTotal), size: 28 }), new TextRun({ text: `  (${data.drLevel || ''})`, bold: true, color: drTotalColor(drTotal), size: 24 })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2000, 800, 6560], rows: [
          new TableRow({ children: [
            makeCell('Dimension', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 2000 }),
            makeCell('Score', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 800, align: AlignmentType.CENTER }),
            makeCell('Rationale', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 6560 }),
          ] }),
          ...drTableRows,
        ] }),

        // PE Analysis
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Traditional PE Suitability Assessment')] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Total Score: ${data.peTotalScore || 0} / 20`, bold: true, color: peTotalColor(data.peTotalScore || 0), size: 28 }), new TextRun({ text: `  (${data.peLevel || ''})`, bold: true, color: peTotalColor(data.peTotalScore || 0), size: 24 })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1600, 600, 1800, 5360], rows: [
          new TableRow({ children: [
            makeCell('Criterion', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 1600 }),
            makeCell('Score', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 600, align: AlignmentType.CENTER }),
            makeCell('Metric', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 1800 }),
            makeCell('Rationale', { bold: true, fill: COLORS.navy, color: 'FFFFFF', width: 5360 }),
          ] }),
          ...peTableRows,
        ] }),

        // Net Assessment
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Overall B.AI Score & Net Assessment')] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.netAssessment || '', color: COLORS.darkGray })] }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

// ─── Upload to Supabase Storage ───
export async function generateAndUploadReports(data: ScoringData): Promise<{ hasPptx: boolean; hasDocx: boolean }> {
  const supabase = getSupabase();
  const folder = data.folder;
  const baseName = data.companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '');

  try {
    console.log(`[reports] Generating PPTX for ${data.companyName}...`);
    const pptxBuffer = await generatePptxBuffer(data);
    const pptxPath = `${folder}/${baseName}_Screening_Assessment.pptx`;
    const { error: pptxErr } = await supabase.storage.from('reports').upload(pptxPath, pptxBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      upsert: true,
    });
    if (pptxErr) console.error(`[reports] PPTX upload error:`, pptxErr.message);

    console.log(`[reports] Generating DOCX for ${data.companyName}...`);
    const docxBuffer = await generateDocxBuffer(data);
    const docxPath = `${folder}/${baseName}_Screening_Assessment.docx`;
    const { error: docxErr } = await supabase.storage.from('reports').upload(docxPath, docxBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: true,
    });
    if (docxErr) console.error(`[reports] DOCX upload error:`, docxErr.message);

    console.log(`[reports] Reports uploaded for ${data.companyName}`);
    return { hasPptx: !pptxErr, hasDocx: !docxErr };
  } catch (error) {
    console.error(`[reports] Failed to generate reports:`, error);
    return { hasPptx: false, hasDocx: false };
  }
}
