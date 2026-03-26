# B.AI Screening Assessment - scoring_data.json Schema (v4)

## CRITICAL: Follow this schema EXACTLY

The PPTX and DOCX generators will crash or show "undefined" values if fields are missing, misnamed, or structured differently. This document defines the EXACT JSON structure required.

### ⛔ MOST COMMON STRUCTURAL FAILURES (from v4.3 calibration runs):
1. VC data stored under `"vc"` or `"vcScoring"` → MUST be `"valueCreation"`
2. DR data stored under `"dr"` or `"drScoring"` → MUST be `"disruptionRisk"`
3. PE data stored under `"pe"` → MUST be `"peSuitability"` (flat array)
4. Matrix fields nested under `"matrix": {}` → MUST be top-level keys
5. Categories/dimensions as arrays `[{name: ..., score: ...}]` → MUST be dicts `{"Name": {score: ...}}`
6. `researchSummary` with wrong keys (e.g., `businessModel` instead of `companyOverview`)
7. `topOpportunities` as bare strings → MUST be `[{title, description}]`
8. PE criterion `"Growth"` → MUST be `"Growth Rate"`

---

## Complete JSON Template

```json
{
  "companyName": "Company Name",
  "sector": "Sector / Sub-sector",
  "date": "2026-03-05",
  "businessDescription": "2-4 sentence description of the company, its business model, key markets, and scale.",

  "keyMetrics": [
    {"label": "Revenue", "value": "$XXM"},
    {"label": "Employees", "value": "~X,XXX"},
    {"label": "EBITDA Margin", "value": "XX%"},
    {"label": "Market Position", "value": "Description"}
  ],

  "vcTotalScore": 7,
  "vcLevel": "Low",
  "vcNonAiTotalScore": 7,
  "vcNonAiLevel": "Low",

  "valueCreation": {
    "categories": {
      "Customer Service": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Cost Optimization",
        "rationale": "Explanation of AI and non-AI value creation potential."
      },
      "Internal Software Development": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Cost Optimization",
        "rationale": "Explanation..."
      },
      "Back Office": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Cost Optimization",
        "rationale": "Explanation..."
      },
      "Supply Chain": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Cost Optimization",
        "rationale": "Explanation..."
      },
      "Sales & Marketing": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Revenue Optimization",
        "rationale": "Explanation..."
      },
      "Customer Lifetime Value": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Revenue Transformation",
        "rationale": "Explanation..."
      },
      "New Products/Services": {
        "score": 1,
        "nonAiScore": 1,
        "tier": "Revenue Transformation",
        "rationale": "Explanation..."
      }
    }
  },

  "topOpportunities": [
    {
      "title": "Short title (max 60 chars)",
      "description": "1-2 sentence description of the opportunity and its potential impact."
    },
    {
      "title": "Another opportunity",
      "description": "Description..."
    },
    {
      "title": "Third opportunity",
      "description": "Description..."
    }
  ],

  "drTotalScore": 4,
  "drLevel": "Low",

  "disruptionRisk": {
    "dimensions": {
      "Business Model Disruption": {
        "score": 1,
        "rationale": "Explanation of how AI may disrupt the core business model."
      },
      "Value Chain Disruption": {
        "score": 1,
        "rationale": "Explanation..."
      },
      "New AI-Native Products/Services": {
        "score": 1,
        "rationale": "Explanation..."
      },
      "New AI-Native Entrants": {
        "score": 1,
        "rationale": "Explanation..."
      }
    }
  },

  "keyDisruptionFindings": [
    {
      "title": "Short finding title (max 60 chars)",
      "description": "1-2 sentence description of the disruption finding.",
      "severity": 3
    },
    {
      "title": "Another finding",
      "description": "Description...",
      "severity": 2
    },
    {
      "title": "Third finding",
      "description": "Description...",
      "severity": 4
    }
  ],

  "peTotalScore": 0,
  "peLevel": "Low",

  "peSuitability": [
    {"category": "Growth Rate", "score": 0, "metric": ">15% or <5%", "rationale": "Explanation..."},
    {"category": "Cyclicality", "score": 0, "metric": "<5% variance", "rationale": "Explanation..."},
    {"category": "Capital Intensity", "score": 0, "metric": "<10% of revenue", "rationale": "Explanation..."},
    {"category": "EBITDA Margin", "score": 0, "metric": ">20%", "rationale": "Explanation..."},
    {"category": "Cash Generation", "score": 0, "metric": ">95% conversion", "rationale": "Explanation..."},
    {"category": "Binary Outcomes", "score": 0, "metric": "<10% concentration", "rationale": "Explanation..."},
    {"category": "Value Chain Position", "score": 0, "metric": "Critical/Important/Commodity", "rationale": "Explanation..."},
    {"category": "Dominant Competitor", "score": 0, "metric": "<20% share", "rationale": "Explanation..."},
    {"category": "Market Fragmentation", "score": 0, "metric": ">100 competitors", "rationale": "Explanation..."},
    {"category": "Customer Concentration", "score": 0, "metric": "<20% top customer", "rationale": "Explanation..."}
  ],

  "matrixClassification": "Avoid",
  "classification": "Red",
  "classificationColor": "Red",

  "netAssessment": "2-3 sentence overall assessment summarizing the company's AI value creation potential, disruption risk, and PE suitability. Include the scores and levels.",

  "investmentSummary": {
    "highlights": [
      "Key investment highlight 1",
      "Key investment highlight 2",
      "Key investment highlight 3"
    ],
    "risks": [
      "Key investment risk 1",
      "Key investment risk 2",
      "Key investment risk 3"
    ],
    "valueCreationPlan": [
      "Value creation action 1",
      "Value creation action 2",
      "Value creation action 3"
    ]
  },

  "researchSummary": {
    "companyOverview": "Brief company overview...",
    "coreCapabilities": "Core capabilities...",
    "aiAdoption": "AI adoption status...",
    "competitivePosition": "Competitive position...",
    "investmentBackground": "PE/investment background...",
    "growthTrajectory": "Growth trajectory...",
    "marketTrends": "Market trends..."
  },

  "dataAvailabilityNote": {
    "proxyCount": 0,
    "dataQuality": "Good",
    "confidenceLevel": "Medium-High"
  }
}
```

---

## FIELD RULES - READ CAREFULLY

### valueCreation (PPTX lines 207-219, DOCX lines 99-119)
- **MUST** be: `{"categories": {"Name": {"score": X, "nonAiScore": X, "tier": "...", "rationale": "..."}}}`
- The generators iterate: `Object.values(vcCategories).forEach((subs) => { Object.entries(subs).forEach(([subName, subData]) => ...)})`
- This means `valueCreation` has ONE key ("categories") whose value is a dict of category names
- **NEVER** use: `category1`, `category2`, etc. as keys
- **NEVER** use arrays/lists for categories
- **NEVER** omit the outer "categories" wrapper
- Each category MUST have: `score` (number 1-5, half-points allowed e.g. 1.5, 2.5), `nonAiScore` (number 1-5, half-points allowed), `tier` (string), `rationale` (string)
- The `tier` field must be exactly one of: "Cost Optimization", "Revenue Optimization", "Revenue Transformation"

### disruptionRisk (PPTX lines 310-320, DOCX lines 122-140)
- **MUST** be: `{"dimensions": {"Name": {"score": X, "rationale": "..."}}}`
- Same iteration pattern as valueCreation
- **NEVER** use: `dimension1`, `dimension2`, etc. as keys
- **NEVER** use arrays/lists for dimensions
- **NEVER** omit the outer "dimensions" wrapper
- Each dimension MUST have: `score` (number 1-5, half-points allowed e.g. 1.5, 2.5, 3.5, 4.5), `rationale` (string)

### peSuitability (PPTX lines 400-409, DOCX lines 143-159)
- **MUST** be an ARRAY of exactly 10 objects
- Each object MUST have: `category` (string), `score` (int 0-2), `metric` (string), `rationale` (string)
- **NEVER** use `criterion`, `name`, `note`, or `value` instead of the correct field names
- The 10 standard categories are: Growth Rate, Cyclicality, Capital Intensity, EBITDA Margin, Cash Generation, Binary Outcomes, Value Chain Position, Dominant Competitor, Market Fragmentation, Customer Concentration

### topOpportunities (PPTX lines 249-269)
- **MUST** be an array of objects with `title` and `description` fields
- **NEVER** use plain strings
- Include 3-4 opportunities

### keyDisruptionFindings (PPTX lines 339-358)
- **MUST** be an array of objects with `title`, `description`, and `severity` fields
- `severity` is an integer 1-5
- **NEVER** use plain strings
- Include 3-4 findings

### keyMetrics (PPTX lines 140-159)
- **MUST** be an array of objects with `label` and `value` fields
- Include exactly 4 metrics

### investmentSummary
- **MUST** be an object with `highlights` (array of strings), `risks` (array of strings), `valueCreationPlan` (array of strings)
- **NEVER** use a plain string

### netAssessment
- **MUST** be a non-empty string
- Should summarize: scores, levels, classification, and key takeaway

---

## SCORING RULES (v4)

### AI Value Creation (11-55 total, Tier 3 weighted 3×)
- 7 categories, each scored 1-5 for BOTH AI and Non-AI. Half-point scores (1.5, 2.5, 3.5, 4.5) are allowed.
- Tier 3 categories (Customer Lifetime Value, New Products/Services) carry a **3× weight multiplier** — raw score × 3 in the total.
- 1 = Minimal: No material AI impact (<1pp EBITDA margin improvement)
- 2 = Low: Limited impact (1-3pp EBITDA margin improvement)
- 3 = Moderate: Meaningful impact (3-5pp EBITDA margin improvement)
- 4 = High: Significant impact (5-8pp EBITDA margin improvement)
- 5 = Transformative: Major impact (>8pp EBITDA margin improvement)
- **vcTotalScore** = CS + ISD + BO + SC + S&M + (CLV × 3) + (NP/S × 3). Range: 11-55.
- **vcNonAiTotalScore** = same formula with Non-AI scores. Range: 11-55.
- Level: 11-25 = Low, 26-40 = Medium, 41-55 = High
- **IMPORTANT**: The JSON stores RAW scores (1-5) in each category. The vcTotalScore/vcNonAiTotalScore fields store the WEIGHTED totals.
- **CALIBRATED PE PARTNER STANDARD**: Tier 3 scoring starts at Score 2 for typical mid-market PE companies. Score 3 requires identifiable data/assets and plausible AI mechanism. Score 4+ requires concrete evidence.

### AI Disruption Risk (4-20 total)
- 4 dimensions, each scored 1-5. Half-point scores (1.5, 2.5, 3.5, 4.5) are allowed.
- 1 = Minimal pressure, 2 = Low, 3 = Moderate, 4 = High, 5 = Severe
- drTotalScore = sum of all dimension scores (4-20)
- Level: 4-9 = Low, 10-14 = Medium, 15-20 = High

### PE Suitability (0-20 total)
- 10 criteria, each scored 0-2
- 0 = Unfavorable, 1 = Moderate, 2 = Favorable
- peTotalScore = sum of all criteria scores (0-20)
- Level: 0-6 = Low, 7-13 = Medium, 14-20 = High

### Decisioning Matrix (vcLevel x drLevel) — v4
| VC \ DR | Low (4-9) | Medium (10-14) | High (15-20) |
|---------|-----------|----------------|--------------|
| High (41-55) | Pursue | Pursue | Avoid |
| Medium (26-40) | Pursue | Monitor | Avoid |
| Low (11-25) | Avoid | Avoid | Avoid |

### Classification Colors
- Pursue = Green
- Monitor = Amber
- Avoid = Red

### Classification Color Keys
You MUST set BOTH of these keys to the color value:
- `"classification": "Green"` (or "Amber" or "Red")
- `"classificationColor": "Green"` (or "Amber" or "Red")

Both must be present and identical. Downstream tools may check either key.

---

## COMMON MISTAKES TO AVOID

1. Using `category1: {"Name": {...}}` instead of `categories: {"Name": {...}}`
2. Using `dimension1: {"Name": {...}}` instead of `dimensions: {"Name": {...}}`
3. Using `criterion` or `name` instead of `category` in PE items
4. Using `note` instead of `metric` in PE items
5. Using `justification` instead of `rationale`
6. Putting strings instead of objects in topOpportunities or keyDisruptionFindings
7. Making investmentSummary a string instead of an object
8. Omitting netAssessment
9. Using non-standard category/dimension names
10. Having scores that don't add up to the declared totals
11. Missing the `nonAiScore` field in value creation categories
12. Using arrays instead of dicts for valueCreation or disruptionRisk
13. **v4 SPECIFIC**: Using old v3 category names ("Revenue Increase Potential", "Supply Chain and Logistics") instead of v4 names ("Customer Lifetime Value", "Supply Chain")
14. **v4 SPECIFIC**: Using old v3 dimension names ("Pricing/Volume Disruption", "Competitive Basis Shift", "Product/Service Change", "Cost Shift") instead of v4 names ("Value Chain Disruption", "New AI-Native Products/Services", "New AI-Native Entrants")
15. **v4 SPECIFIC**: Using 5 DR dimensions (v3) instead of 4 (v4)
16. **v4 SPECIFIC**: Using 6 VC categories (v3) instead of 7 (v4)
17. **v4 SPECIFIC**: Missing the `tier` field in value creation categories
18. **v4 SPECIFIC**: Using v3 matrix classifications ("Top Priority", "Prioritize", "Deprioritize") — v4 only has Pursue/Monitor/Avoid
19. **PRODUCTION**: Returning peSuitability as `{"scores": [...]}` instead of a flat array `[...]` — the auto-fix script normalizes this but you should produce the correct format
20. **PRODUCTION**: Missing `classificationColor` key — MUST include both `classification` and `classificationColor` with identical values
21. **PRODUCTION**: Saving the file to the wrong folder path — use the EXACT path provided, do not abbreviate or rename
22. **PRODUCTION**: Not actually saving the file — you MUST call Write tool and verify the file exists afterward
