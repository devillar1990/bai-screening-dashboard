import { ScoringData } from './types';
import { createClient } from '@supabase/supabase-js';

export interface ScreeningJob {
  id: string;
  companyName: string;
  status: 'pending' | 'researching' | 'scoring' | 'validating' | 'complete' | 'error';
  result?: ScoringData;
  error?: string;
  createdAt: number;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key);
}

export async function createJob(id: string, companyName: string): Promise<ScreeningJob> {
  const supabase = getSupabase();
  const job: ScreeningJob = {
    id,
    companyName,
    status: 'pending',
    createdAt: Date.now(),
  };

  const { error } = await supabase.from('screening_jobs').insert({
    id: job.id,
    company_name: job.companyName,
    status: job.status,
    created_at: new Date(job.createdAt).toISOString(),
  });

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return job;
}

export async function updateJob(id: string, update: Partial<ScreeningJob>) {
  const supabase = getSupabase();

  const row: Record<string, unknown> = {};
  if (update.status) row.status = update.status;
  if (update.error) row.error = update.error;
  if (update.result) row.result = update.result;

  const { error } = await supabase
    .from('screening_jobs')
    .update(row)
    .eq('id', id);

  if (error) throw new Error(`Failed to update job: ${error.message}`);
}

export async function getJob(id: string): Promise<ScreeningJob | undefined> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('screening_jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    companyName: data.company_name,
    status: data.status,
    result: data.result || undefined,
    error: data.error || undefined,
    createdAt: new Date(data.created_at).getTime(),
  };
}
