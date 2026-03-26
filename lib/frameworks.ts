import fs from 'fs';
import path from 'path';

const FRAMEWORKS_DIR = path.resolve(process.cwd(), 'frameworks');

export function loadFramework(name: string): string {
  const filePath = path.join(FRAMEWORKS_DIR, name);
  return fs.readFileSync(filePath, 'utf-8');
}

export function loadAllFrameworks(): {
  scoring: string;
  disruption: string;
  pe: string;
  schema: string;
} {
  return {
    scoring: loadFramework('scoring_framework.md'),
    disruption: loadFramework('disruption_framework.md'),
    pe: loadFramework('pe_suitability_framework.md'),
    schema: loadFramework('scoring_json_schema.md'),
  };
}
