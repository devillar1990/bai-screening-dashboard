import Anthropic from '@anthropic-ai/sdk';
import { loadAllFrameworks } from './frameworks';
import { ScreeningRequest, ScoringData } from './types';
import { validateAndFix } from './validation';

function getApiKey(): string {
  // Next.js should load .env.local automatically, but as a fallback read it directly
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(process.cwd(), '.env.local');
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
      if (match) apiKey = match[1].trim();
    } catch {}
  }
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('ANTHROPIC_API_KEY is not configured in .env.local');
  }
  return apiKey;
}

function getClient() {
  return new Anthropic({ apiKey: getApiKey() });
}

export async function runScreening(request: ScreeningRequest): Promise<ScoringData> {
  const frameworks = loadAllFrameworks();

  const sectorDisplay = request.subSector
    ? `${request.sector} / ${request.subSector}`
    : request.sector;

  const companyInfo = [
    `Company: ${request.companyName}`,
    `Sector: ${sectorDisplay}`,
    request.revenue ? `Revenue: ${request.revenue}` : null,
    request.ebitda ? `EBITDA: ${request.ebitda}` : null,
    request.notes ? `Notes: ${request.notes}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are a Brightstar.AI screening analyst. You evaluate companies for PE investment using the B.AI Screening Framework v4.3.1.

Your task is to research and score a company across three pillars:
1. AI Value Creation (VC) — 7 categories, scored 1–5, Tier 3 weighted 3×. Range: 11–55.
2. AI Disruption Risk (DR) — 4 dimensions, scored 1–5. Range: 4–20.
3. PE Suitability (PE) — 10 criteria, scored 0–2. Range: 0–20.

You MUST use web search to research the company thoroughly before scoring.

CRITICAL SCORING RULES:
- Tier 3 (CLV, NP/S) starts at Score 2 for typical mid-market PE companies
- Score 3 requires identifiable data/assets + plausible AI mechanism
- Score 4+ requires concrete evidence
- All Tier 1 categories require checking spend as % of opex (Score 1 if <6%)
- DR is forward-looking to end of 3–5 year hold period
- PE criteria use quantitative thresholds exactly

After scoring, apply the Decisioning Matrix:
- High DR = Always Avoid
- Low VC = Always Avoid
- High/Medium VC + Low DR = Pursue
- High VC + Medium DR = Pursue
- Medium VC + Medium DR = Monitor

MANDATORY SELF-CHECK before responding:
- vcTotalScore = CS + ISD + BO + SC + S&M + (CLV×3) + (NP/S×3)
- drTotalScore = sum of all 4 dimension scores
- peTotalScore = sum of all 10 PE scores
- Verify levels match thresholds (VC: 11-25=Low, 26-40=Med, 41-55=High; DR: 4-9=Low, 10-14=Med, 15-20=High; PE: 0-6=Low, 7-13=Med, 14-20=High)
- Matrix classification matches VC×DR lookup`;

  const userPrompt = `Research and score this company:

${companyInfo}

SCORING FRAMEWORKS:

## Value Creation Framework
${frameworks.scoring}

## Disruption Risk Framework
${frameworks.disruption}

## PE Suitability Framework
${frameworks.pe}

## Output JSON Schema
${frameworks.schema}

INSTRUCTIONS:
1. Use web search to research the company: business model, revenue, employees, market position, AI adoption, competitive landscape, PE/investment history, growth trajectory.
2. Score all three pillars following the framework rules above.
3. Apply the decisioning matrix.
4. Return ONLY valid JSON matching the scoring_data.json schema. No markdown, no code blocks, just raw JSON.`;

  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    system: systemPrompt,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract JSON from the response, handling prose mixed with JSON
  let rawData = extractJson(response.content);

  // If no valid JSON found, do a follow-up turn asking for just JSON
  if (!rawData) {
    const followUp = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: response.content },
        { role: 'user', content: 'Now return ONLY the valid JSON object matching the schema. No prose, no markdown, no explanation — just the raw JSON starting with { and ending with }.' },
      ],
    });

    rawData = extractJson(followUp.content);
    if (!rawData) {
      throw new Error('Failed to extract valid JSON from Claude response after retry');
    }
  }

  const validated = validateAndFix(rawData);
  return validated;
}

function extractJson(content: Anthropic.Messages.ContentBlock[]): Record<string, unknown> | null {
  let fullText = '';
  for (const block of content) {
    if (block.type === 'text') {
      fullText += block.text;
    }
  }

  // Strip markdown code fences
  fullText = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try parsing the whole text as JSON first
  try {
    return JSON.parse(fullText);
  } catch {}

  // Find the outermost JSON object by matching braces
  const start = fullText.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = start; i < fullText.length; i++) {
    if (fullText[i] === '{') depth++;
    else if (fullText[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (end === -1) return null;

  try {
    return JSON.parse(fullText.substring(start, end + 1));
  } catch {}

  return null;
}
