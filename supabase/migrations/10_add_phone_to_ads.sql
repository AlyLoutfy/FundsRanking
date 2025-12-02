-- Add phone and text_en columns to ads table
alter table public.ads
add column if not exists phone text,
add column if not exists text_en text;
