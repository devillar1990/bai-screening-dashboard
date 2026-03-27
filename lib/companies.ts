import { ScoringData } from './types';
import { getAllCompletedScreenings } from './screening-store';
import companiesData from '@/data/companies.json';

const companies = companiesData as ScoringData[];

export function getAllCompanies(): ScoringData[] {
  return companies;
}

export async function getAllCompaniesMerged(): Promise<ScoringData[]> {
  let dynamicScreenings: ScoringData[] = [];
  try {
    dynamicScreenings = await getAllCompletedScreenings();
  } catch {
    // Supabase unavailable — fall back to static only
  }

  if (dynamicScreenings.length === 0) return companies;

  // Merge: static first, dynamic overwrites on duplicate folder
  const merged = new Map<string, ScoringData>();
  for (const c of companies) {
    merged.set(c.folder, c);
  }
  for (const c of dynamicScreenings) {
    if (c.folder) {
      merged.set(c.folder, c);
    }
  }
  return Array.from(merged.values());
}

export function getCompanyByFolder(folder: string): ScoringData | undefined {
  return companies.find(c => c.folder === folder);
}

export function getCompanyStats(input?: ScoringData[]) {
  const data = input || companies;
  const total = data.length;
  const pursue = data.filter(c => c.matrixClassification === 'Pursue').length;
  const monitor = data.filter(c => c.matrixClassification === 'Monitor').length;
  const avoid = data.filter(c => c.matrixClassification === 'Avoid').length;

  const vcScores = data.map(c => c.vcTotalScore);
  const drScores = data.map(c => c.drTotalScore);
  const peScores = data.map(c => c.peTotalScore);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    total,
    pursue,
    monitor,
    avoid,
    vcMean: Math.round(avg(vcScores) * 10) / 10,
    drMean: Math.round(avg(drScores) * 10) / 10,
    peMean: Math.round(avg(peScores) * 10) / 10,
  };
}

export function getSectors(): string[] {
  const sectors = new Set(companies.map(c => c.sector?.split(' / ')[0] || 'Unknown'));
  return Array.from(sectors).sort();
}
