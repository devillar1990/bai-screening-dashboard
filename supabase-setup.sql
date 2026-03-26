-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

create table screening_jobs (
  id uuid primary key,
  company_name text not null,
  status text not null default 'pending',
  result jsonb,
  error text,
  created_at timestamptz not null default now()
);

-- Allow the service role full access
alter table screening_jobs enable row level security;

create policy "Service role full access"
  on screening_jobs
  for all
  using (true)
  with check (true);
