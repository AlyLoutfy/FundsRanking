-- Create Audit Logs Table
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references auth.users not null,
  admin_email text,
  action text not null, -- 'approve', 'reject', 'toggle_ad'
  target_type text not null, -- 'submission', 'ad'
  target_id uuid not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_logs enable row level security;

-- Policies for Audit Logs
create policy "Admins can view audit logs"
  on public.admin_logs for select
  using ( public.is_admin() );

create policy "Admins can insert audit logs"
  on public.admin_logs for insert
  with check ( public.is_admin() );

-- Fix Submissions RLS (Allow admins to update status)
create policy "Admins can update submissions"
  on public.fund_submissions for update
  using ( public.is_admin() );
