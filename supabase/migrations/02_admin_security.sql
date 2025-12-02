-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policy: Public can view profiles (needed to check roles? No, usually only the user needs to check their own role)
-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Policy: Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using ( 
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Trigger to create a profile when a user signs up (Optional, but good for auto-creation)
-- For now, we will rely on manual creation or auto-creation via trigger
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


-- UPDATE EXISTING POLICIES TO USE ROLE CHECK

-- Funds: Only admins can insert/update/delete
drop policy if exists "Admins can do everything on funds" on public.funds;

create policy "Admins can insert funds"
  on public.funds for insert
  with check ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Admins can update funds"
  on public.funds for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Admins can delete funds"
  on public.funds for delete
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Ads: Only admins can insert/update/delete
drop policy if exists "Admins can do everything on ads" on public.ads;

create policy "Admins can insert ads"
  on public.ads for insert
  with check ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Admins can update ads"
  on public.ads for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Admins can delete ads"
  on public.ads for delete
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Submissions: Only admins can view
drop policy if exists "Admins can view submissions" on public.fund_submissions;

create policy "Admins can view submissions"
  on public.fund_submissions for select
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );
