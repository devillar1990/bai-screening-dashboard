/**
 * One-time script to upload existing PPTX/DOCX reports to Supabase Storage.
 *
 * Usage: node scripts/upload-reports.js
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Or create a .env.local file in the project root.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const COMPANY_DIR = path.resolve(__dirname, '../../bai-screen3/Company List');

async function uploadReports() {
  if (!fs.existsSync(COMPANY_DIR)) {
    console.error(`Company directory not found: ${COMPANY_DIR}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(COMPANY_DIR).filter(f => {
    return fs.statSync(path.join(COMPANY_DIR, f)).isDirectory();
  });

  console.log(`Found ${folders.length} company folders`);
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const folder of folders) {
    const folderPath = path.join(COMPANY_DIR, folder);
    const files = fs.readdirSync(folderPath);

    const pptxFile = files.find(f => f.endsWith('.pptx'));
    const docxFile = files.find(f => f.endsWith('.docx'));

    if (!pptxFile && !docxFile) {
      skipped++;
      continue;
    }

    for (const file of [pptxFile, docxFile].filter(Boolean)) {
      const filePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `${folder}/${file}`;

      const contentType = file.endsWith('.pptx')
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const { error } = await supabase.storage.from('reports').upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

      if (error) {
        console.error(`  ERROR uploading ${storagePath}: ${error.message}`);
        errors++;
      }
    }

    uploaded++;
    if (uploaded % 10 === 0) {
      console.log(`  Uploaded ${uploaded}/${folders.length - skipped} companies...`);
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped (no files): ${skipped}, Errors: ${errors}`);
}

uploadReports().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
