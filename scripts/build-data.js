/**
 * Merges all scoring_data.json files from bai-screen3/Company List/ into a single companies.json
 */
const fs = require('fs');
const path = require('path');

const COMPANY_LIST_DIR = path.resolve(__dirname, '../../bai-screen3/Company List');
const OUTPUT_FILE = path.resolve(__dirname, '../data/companies.json');

const folders = fs.readdirSync(COMPANY_LIST_DIR).filter(f => {
  const stat = fs.statSync(path.join(COMPANY_LIST_DIR, f));
  return stat.isDirectory();
});

const companies = [];

for (const folder of folders) {
  const scoringPath = path.join(COMPANY_LIST_DIR, folder, 'scoring_data.json');
  if (!fs.existsSync(scoringPath)) continue;

  try {
    const raw = fs.readFileSync(scoringPath, 'utf-8');
    const data = JSON.parse(raw);

    // Check for existing PPTX/DOCX
    const pptxExists = fs.readdirSync(path.join(COMPANY_LIST_DIR, folder))
      .some(f => f.endsWith('.pptx'));
    const docxExists = fs.readdirSync(path.join(COMPANY_LIST_DIR, folder))
      .some(f => f.endsWith('.docx'));

    companies.push({
      folder,
      ...data,
      has_pptx: pptxExists,
      has_docx: docxExists,
    });
  } catch (err) {
    console.error(`Error reading ${folder}: ${err.message}`);
  }
}

// Sort alphabetically by company name
companies.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(companies, null, 2));
console.log(`Merged ${companies.length} companies into ${OUTPUT_FILE}`);
