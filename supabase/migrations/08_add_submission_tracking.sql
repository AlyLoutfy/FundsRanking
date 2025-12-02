-- Add tracking columns to fund_submissions
alter table public.fund_submissions 
add column processed_by_email text,
add column processed_at timestamp with time zone;
