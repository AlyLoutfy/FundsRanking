-- Add missing columns to fund_submissions to match the form and funds table
alter table public.fund_submissions
add column if not exists category text,
add column if not exists risk_level text,
add column if not exists return_1y numeric,
add column if not exists min_investment numeric,
add column if not exists fees numeric,
add column if not exists strategy text,
add column if not exists manager text; -- Form doesn't have manager but good to have
