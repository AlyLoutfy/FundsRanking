-- Add missing columns to funds table
alter table public.funds 
add column if not exists logo text,
add column if not exists description_en text,
add column if not exists description_ar text;
