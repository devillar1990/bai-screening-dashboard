import { ScoringData } from './types';
import companiesData from '@/data/companies.json';

const companies = companiesData as ScoringData[];

export function getAllCompanies(): ScoringData[] {
  return companies;
}

export function getCompanyByFolder(folder: string): ScoringData | undefined {
  return companies.find(c => c.folder === folder);
}

export function getCompanyStats() {
  const total = companies.length;
  const pursue = companies.filter(c => c.matrixClassification === 'Pursue').length;
  const monitor = companies.filter(c => c.matrixClassification === 'Monitor').length;
  const avoid = companies.filter(c => c.matrixClassification === 'Avoid').length;

  const vcScores = companies.map(c => c.vcTotalScore);
  const drScores = companies.map(c => c.drTotalScore);
  const peScores = companies.map(c => c.peTotalScore);

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

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
