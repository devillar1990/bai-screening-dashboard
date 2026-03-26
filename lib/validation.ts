import { ScoringData } from './types';

/**
 * TypeScript port of core autofix logic from autofix.py
 * Recalculates totals, fixes levels, and corrects matrix classification.
 */

const VC_CATEGORIES = [
  'Customer Service',
  'Internal Software Development',
  'Back Office',
  'Supply Chain',
  'Sales & Marketing',
  'Customer Lifetime Value',
  'New Products/Services',
];

const TIER3_CATEGORIES = ['Customer Lifetime Value', 'New Products/Services'];

function getVCLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 41) return 'High';
  if (score >= 26) return 'Medium';
  return 'Low';
}

function getDRLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 15) return 'High';
  if (score >= 10) return 'Medium';
  return 'Low';
}

function getPELevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 14) return 'High';
  if (score >= 7) return 'Medium';
  return 'Low';
}

function getMatrixClassification(vcLevel: string, drLevel: string): { classification: 'Pursue' | 'Monitor' | 'Avoid'; color: 'Green' | 'Amber' | 'Red' } {
  if (drLevel === 'High') return { classification: 'Avoid', color: 'Red' };
  if (vcLevel === 'Low') return { classification: 'Avoid', color: 'Red' };
  if (vcLevel === 'High' && drLevel === 'Low') return { classification: 'Pursue', color: 'Green' };
  if (vcLevel === 'High' && drLevel === 'Medium') return { classification: 'Pursue', color: 'Green' };
  if (vcLevel === 'Medium' && drLevel === 'Low') return { classification: 'Pursue', color: 'Green' };
  if (vcLevel === 'Medium' && drLevel === 'Medium') return { classification: 'Monitor', color: 'Amber' };
  return { classification: 'Avoid', color: 'Red' };
}

export function validateAndFix(data: Partial<ScoringData>): ScoringData {
  const result = { ...data } as ScoringData;

  // Recalculate VC total
  if (result.valueCreation?.categories) {
    let vcTotal = 0;
    let vcNonAiTotal = 0;
    for (const catName of VC_CATEGORIES) {
      const cat = (result.valueCreation.categories as Record<string, { score: number; nonAiScore: number }>)[catName];
      if (!cat) continue;
      const weight = TIER3_CATEGORIES.includes(catName) ? 3 : 1;
      vcTotal += cat.score * weight;
      vcNonAiTotal += cat.nonAiScore * weight;
    }
    result.vcTotalScore = vcTotal;
    result.vcNonAiTotalScore = vcNonAiTotal;
  }

  // Recalculate DR total
  if (result.disruptionRisk?.dimensions) {
    let drTotal = 0;
    for (const dim of Object.values(result.disruptionRisk.dimensions)) {
      drTotal += dim.score;
    }
    result.drTotalScore = drTotal;
  }

  // Recalculate PE total
  if (result.peSuitability && Array.isArray(result.peSuitability)) {
    result.peTotalScore = result.peSuitability.reduce((sum, item) => sum + item.score, 0);
  }

  // Fix levels
  result.vcLevel = getVCLevel(result.vcTotalScore);
  result.vcNonAiLevel = getVCLevel(result.vcNonAiTotalScore);
  result.drLevel = getDRLevel(result.drTotalScore);
  result.peLevel = getPELevel(result.peTotalScore);

  // Fix matrix
  const matrix = getMatrixClassification(result.vcLevel, result.drLevel);
  result.matrixClassification = matrix.classification;
  result.classificationColor = matrix.color;
  result.classification = matrix.color;

  return result;
}
