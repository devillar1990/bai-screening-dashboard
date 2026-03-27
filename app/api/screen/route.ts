import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { runScreening } from '@/lib/claude';
import { createJob, updateJob } from '@/lib/screening-store';
import { generateAndUploadReports } from '@/lib/generate-reports';
import { ScreeningRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: ScreeningRequest = await request.json();

    if (!body.companyName || !body.sector) {
      return NextResponse.json({ error: 'Company name and sector are required' }, { status: 400 });
    }

    const id = uuidv4();
    await createJob(id, body.companyName);

    // Run screening in background (non-blocking response)
    runScreeningAsync(id, body);

    return NextResponse.json({ id, status: 'pending' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

async function runScreeningAsync(id: string, request: ScreeningRequest) {
  try {
    console.log(`[screening:${id}] Starting research for ${request.companyName}`);
    await updateJob(id, { status: 'researching' });

    const result = await runScreening(request);
    console.log(`[screening:${id}] Research complete, got result`);

    // Generate folder name
    const folderName = request.companyName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    result.folder = folderName;
    result.date = new Date().toISOString().split('T')[0];

    await updateJob(id, { status: 'validating' });

    // Generate and upload PPTX/DOCX reports
    console.log(`[screening:${id}] Generating reports...`);
    const reports = await generateAndUploadReports(result);
    result.has_pptx = reports.hasPptx;
    result.has_docx = reports.hasDocx;

    await updateJob(id, { status: 'complete', result });
    console.log(`[screening:${id}] Complete!`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Screening failed';
    console.error(`[screening:${id}] ERROR:`, msg);
    try {
      await updateJob(id, { status: 'error', error: msg });
    } catch (updateErr) {
      console.error(`[screening:${id}] Failed to update error status:`, updateErr);
    }
  }
}
