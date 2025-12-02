-- Add email column to ads table
alter table public.ads 
add column if not exists email text;

-- Allow admins to view all ads (including pending)
create policy "Admins can view all ads"
  on public.ads for select
  using ( public.is_admin() );
