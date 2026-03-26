export interface KeyMetric {
  label: string;
  value: string;
}

export interface VCCategory {
  score: number;
  nonAiScore: number;
  tier: 'Cost Optimization' | 'Revenue Optimization' | 'Revenue Transformation';
  rationale: string;
}

export interface ValueCreation {
  categories: {
    'Customer Service': VCCategory;
    'Internal Software Development': VCCategory;
    'Back Office': VCCategory;
    'Supply Chain': VCCategory;
    'Sales & Marketing': VCCategory;
    'Customer Lifetime Value': VCCategory;
    'New Products/Services': VCCategory;
  };
}

export interface DRDimension {
  score: number;
  rationale: string;
}

export interface DisruptionRisk {
  dimensions: {
    'Business Model Disruption': DRDimension;
    'Value Chain Disruption': DRDimension;
    'New AI-Native Products/Services': DRDimension;
    'New AI-Native Entrants': DRDimension;
  };
}

export interface TopOpportunity {
  title: string;
  description: string;
}

export interface KeyDisruptionFinding {
  title: string;
  description: string;
  severity: number;
}

export interface PECriterion {
  category: string;
  score: number;
  metric: string;
  rationale: string;
}

export interface InvestmentSummary {
  highlights: string[];
  risks: string[];
  valueCreationPlan: string[];
}

export interface ResearchSummary {
  companyOverview: string;
  coreCapabilities: string;
  aiAdoption: string;
  competitivePosition: string;
  investmentBackground: string;
  growthTrajectory: string;
  marketTrends: string;
}

export interface DataAvailabilityNote {
  proxyCount: number;
  dataQuality: string;
  confidenceLevel: string;
}

export interface ScoringData {
  folder: string;
  companyName: string;
  sector: string;
  date?: string;
  businessDescription: string;
  keyMetrics: KeyMetric[];
  vcTotalScore: number;
  vcLevel: 'Low' | 'Medium' | 'High';
  vcNonAiTotalScore: number;
  vcNonAiLevel: 'Low' | 'Medium' | 'High';
  valueCreation: ValueCreation;
  topOpportunities: TopOpportunity[];
  drTotalScore: number;
  drLevel: 'Low' | 'Medium' | 'High';
  disruptionRisk: DisruptionRisk;
  keyDisruptionFindings: KeyDisruptionFinding[];
  peTotalScore: number;
  peLevel: 'Low' | 'Medium' | 'High';
  peSuitability: PECriterion[];
  matrixClassification: 'Pursue' | 'Monitor' | 'Avoid';
  classification?: string;
  classificationColor: 'Green' | 'Amber' | 'Red';
  netAssessment: string;
  investmentSummary: InvestmentSummary;
  researchSummary: ResearchSummary;
  dataAvailabilityNote?: DataAvailabilityNote;
  has_pptx?: boolean;
  has_docx?: boolean;
}

export interface ScreeningRequest {
  companyName: string;
  sector: string;
  subSector?: string;
  revenue?: string;
  ebitda?: string;
  notes?: string;
}

export type Classification = 'Pursue' | 'Monitor' | 'Avoid';
export type ClassificationColor = 'Green' | 'Amber' | 'Red';
