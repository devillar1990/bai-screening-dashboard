import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/screening-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const job = await getJob(params.id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    companyName: job.companyName,
    status: job.status,
    result: job.status === 'complete' ? job.result : undefined,
    error: job.error,
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
