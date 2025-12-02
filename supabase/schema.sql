-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Funds Table
create table public.funds (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_ar text not null,
  manager_en text,
  manager_ar text,
  logo text,
  description_en text,
  description_ar text,
  category text,
  risk_level text, -- 'low', 'medium', 'high'
  nav numeric,
  return_1y numeric,
  return_ytd numeric,
  fees numeric,
  min_investment numeric,
  strategy_en text,
  strategy_ar text,
  is_featured boolean default false,
  is_promoted boolean default false,
  is_new boolean default false,
  status text default 'active', -- 'active', 'hidden', 'pending'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ads Table
create table public.ads (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  email text,
  image_url text,
  link_url text,
  text_en text,
  text_ar text,
  start_date date,
  end_date date,
  impressions int default 0,
  clicks int default 0,
  status text default 'pending', -- 'active', 'inactive', 'pending'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fund Submissions Table
create table public.fund_submissions (
  id uuid default uuid_generate_v4() primary key,
  fund_name text not null,
  description text,
  contact_email text,
  category text,
  risk_level text,
  return_1y numeric,
  min_investment numeric,
  fees numeric,
  strategy text,
  manager text,
  status text default 'pending', -- 'pending', 'reviewed'
  processed_by_email text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)

-- Enable RLS
alter table public.funds enable row level security;
alter table public.ads enable row level security;
alter table public.fund_submissions enable row level security;

-- Policies for Funds
-- Public can read active funds
create policy "Public funds are viewable by everyone"
  on public.funds for select
  using ( status = 'active' );

-- Admins can do everything (we'll define admin as authenticated users for now)
create policy "Admins can do everything on funds"
  on public.funds for all
  using ( auth.role() = 'authenticated' );

-- Policies for Ads
create policy "Public active ads are viewable by everyone"
  on public.ads for select
  using ( status = 'active' );

create policy "Admins can do everything on ads"
  on public.ads for all
  using ( auth.role() = 'authenticated' );

-- Policies for Submissions
-- Public can insert (submit)
create policy "Public can submit funds"
  on public.fund_submissions for insert
  with check ( true );

-- Admins can view submissions
create policy "Admins can view submissions"
  on public.fund_submissions for select
  using ( auth.role() = 'authenticated' );

-- ==========================================
-- CONSOLIDATED MIGRATIONS (02, 03, 04)
-- ==========================================

-- 1. Profiles Table & Security (from 02_admin_security.sql & 03_fix_rls_recursion.sql)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Secure function to check admin status (bypasses recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Admins can view all profiles"
  on public.profiles for select
  using ( public.is_admin() );

-- Trigger for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Update Submissions Schema (from 04_update_submissions_schema.sql)
-- (We update the table definition directly above instead of altering it here)

-- 3. Update RLS Policies to use is_admin() (Replacing previous admin policies)

-- Funds
drop policy if exists "Admins can do everything on funds" on public.funds;
create policy "Admins can insert funds" on public.funds for insert with check ( public.is_admin() );
create policy "Admins can update funds" on public.funds for update using ( public.is_admin() );
create policy "Admins can delete funds" on public.funds for delete using ( public.is_admin() );

-- Ads
drop policy if exists "Admins can do everything on ads" on public.ads;
create policy "Admins can insert ads" on public.ads for insert with check ( public.is_admin() );
create policy "Admins can update ads" on public.ads for update using ( public.is_admin() );
create policy "Admins can delete ads" on public.ads for delete using ( public.is_admin() );
create policy "Admins can view all ads" on public.ads for select using ( public.is_admin() );
create policy "Public can submit ads" on public.ads for insert with check ( true );

-- Submissions
drop policy if exists "Admins can view submissions" on public.fund_submissions;
create policy "Admins can view submissions" on public.fund_submissions for select using ( public.is_admin() );
create policy "Admins can update submissions" on public.fund_submissions for update using ( public.is_admin() );

-- Audit Logs
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references auth.users not null,
  admin_email text,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_logs enable row level security;

create policy "Admins can view audit logs" on public.admin_logs for select using ( public.is_admin() );
create policy "Admins can insert audit logs" on public.admin_logs for insert with check ( public.is_admin() );

