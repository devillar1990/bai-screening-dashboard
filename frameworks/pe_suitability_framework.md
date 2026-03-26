# Traditional PE Suitability Assessment Framework

## Scoring Philosophy

This framework evaluates a target company's structural attractiveness for private equity investment, independent of AI considerations. It covers the classic PE investment criteria: growth, stability, capital efficiency, margins, cash generation, regulatory risk, value chain position, competitive dynamics, market structure, and customer concentration.

Each criterion is scored 0-2 using quantitative thresholds where available. The framework complements the AI-focused B.AI pillars (Value Creation Potential and Disruption Risk) to provide a holistic screening view.

## Scale (0-2 per criterion, 10 criteria, max 20)

- **2**: Favorable for PE investment (strong metric, attractive profile)
- **1**: Moderate (acceptable but not standout, mixed signals)
- **0**: Unfavorable (structural constraint or red flag)

## Aggregate Scoring Levels

- **14-20**: High — Strong traditional PE investment profile
- **7-13**: Medium — Meaningful opportunity with some structural constraints
- **0-6**: Low — Limited PE suitability or significant structural headwinds

## 10 Criteria with Decision Rules

### 1. Growth
**Question:** Is the industry/company growing?
**Metric:** Industry revenue CAGR forecast over next 5 years
**Thresholds:**
- **Score 2:** >8% CAGR
- **Score 1:** 5-8% CAGR
- **Score 0:** <5% CAGR

**Fallback hierarchy:**
1. Forward-looking 5-year industry forecast (preferred)
2. Backward-looking 5-year industry CAGR (if forward not available)
3. Company-specific backward-looking 5-year revenue CAGR (last resort)

### 2. Cyclicality
**Question:** Is the industry stable through economic cycles?
**Metric:** Maximum industry revenue drop in a single year over the last decade
**Thresholds:**
- **Score 2:** <5% max drop (highly stable / non-cyclical)
- **Score 1:** 5-10% max drop (moderately cyclical)
- **Score 0:** >10% max drop (highly cyclical)

### 3. Capital Intensity
**Question:** Can the business operate without high CapEx or large fixed asset requirements?
**Metric:** Annual CapEx as a share of revenue
**Thresholds:**
- **Score 2:** <10% CapEx/Revenue (asset-light)
- **Score 1:** 10-20% CapEx/Revenue (moderate)
- **Score 0:** >20% CapEx/Revenue (capital intensive)

### 4. EBITDA Margin
**Question:** Does the business generate healthy margins?
**Metric:** Average EBITDA margin over last 3 years
**Thresholds:**
- **Score 2:** >15% EBITDA margin
- **Score 1:** 5-15% EBITDA margin
- **Score 0:** <5% EBITDA margin

### 5. Cash Generation
**Question:** Does the company generate strong free cash flow?
**Metric:** FCF conversion as % of EBITDA (FCF / EBITDA)
**Thresholds:**
- **Score 2:** >95% FCF conversion
- **Score 1:** 80-95% FCF conversion
- **Score 0:** <80% FCF conversion

### 6. Binary Outcomes
**Question:** Is the company exposed to stroke-of-pen regulatory risk (e.g., drug approvals, antitrust action, regulatory bans)?
**Metric:** Share of revenue exposed to binary regulatory risk
**Thresholds:**
- **Score 2:** <10% of revenue at risk
- **Score 1:** 10-30% of revenue at risk
- **Score 0:** >30% of revenue at risk

### 7. Value Chain Position
**Question:** Does the company have a critical, hard-to-replace role in the industry value chain?
**Metric:** Qualitative assessment of substitutability
**Thresholds:**
- **Score 2:** Company cannot be easily substituted (critical node)
- **Score 1:** Moderate substitutability (important but replaceable with effort)
- **Score 0:** Company is easily substituted (commoditized role)

### 8. Dominant Competitor
**Question:** Is the competitive landscape favorable (no single dominant player crowding out the company)?
**Metric:** Market share of the largest competitor that is NOT the target company
**Thresholds:**
- **Score 2:** Largest competitor has <20% market share (fragmented, no dominant threat)
- **Score 1:** Largest competitor has 20-40% market share (meaningful but manageable)
- **Score 0:** Largest competitor has >40% market share (dominant player risk)

### 9. Market Fragmentation
**Question:** Are there many small competitors with potential for consolidation?
**Metric:** Approximate number of competitors in the industry
**Thresholds:**
- **Score 2:** >100 competitors (highly fragmented, strong roll-up potential)
- **Score 1:** 10-100 competitors (moderately fragmented)
- **Score 0:** <10 competitors (concentrated, limited consolidation opportunity)

### 10. Customer Concentration
**Question:** For B2B businesses, is the customer base diversified?
**Metric:** Revenue share of the largest single customer
**Thresholds:**
- **Score 2:** Largest customer <20% of revenue (diversified)
- **Score 1:** Largest customer 20-40% of revenue (moderate concentration)
- **Score 0:** Largest customer >40% of revenue (high concentration risk)

**Note:** For B2C businesses where no single customer represents material revenue, default score is 2 (diversified by nature).

## Confidence Scoring

- **High:** Company-specific data available from DD materials or verified public filings (2+ sources)
- **Medium:** Industry benchmark with some company context, or single reliable source
- **Low:** Industry proxy only, educated estimate, or limited public data

## Proxy Data Guidelines

When DD materials are not available, use public proxies in this priority order:
1. SEC filings (10-K, 10-Q) for company-specific financials
2. Industry reports (IBISWorld, Gartner, Forrester) for sector benchmarks
3. Analyst reports and equity research for estimates
4. Comparable public company data for peer benchmarking
5. Press releases, investor presentations for qualitative signals

Always document the proxy source in the scoring rationale and set confidence accordingly.

## Calibration Benchmarks

| Company Profile | Expected Score Range | Key Drivers |
|---|---|---|
| High-growth SaaS (>30% CAGR, 80%+ margins) | 16-18 | Growth, margins, cash, asset-light, fragmented |
| Residential services (lawn care, HVAC) | 12-15 | Fragmentation, recurring revenue, moderate margins |
| Industrial manufacturing | 8-12 | Cyclicality, capital intensity offset by value chain position |
| Pharma/biotech | 6-10 | Binary outcomes, regulatory risk, high R&D CapEx |
| Commodity trading | 4-8 | Cyclicality, low margins, high capital intensity |
