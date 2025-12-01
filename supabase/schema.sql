-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Funds Table
create table public.funds (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_ar text not null,
  manager_en text,
  manager_ar text,
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
  status text default 'pending', -- 'pending', 'reviewed'
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
