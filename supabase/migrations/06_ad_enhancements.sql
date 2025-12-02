-- Add expires_at column to ads table
alter table public.ads
add column if not exists expires_at timestamptz;

-- Ensure image_url is present (it should be, but just in case)
alter table public.ads
add column if not exists image_url text;

-- Update RLS to allow admins to update these columns
-- (Existing policies likely cover 'update' on the table, but good to verify if we had column-specific policies. We don't, we have table-level policies.)
