-- Fix RLS Infinite Recursion

-- 1. Create a secure function to check if the current user is an admin
-- This function bypasses RLS (security definer) to avoid recursion when querying the profiles table
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the problematic policy
drop policy if exists "Admins can view all profiles" on public.profiles;

-- 3. Re-create the policy using the secure function
create policy "Admins can view all profiles"
  on public.profiles for select
  using ( public.is_admin() );
