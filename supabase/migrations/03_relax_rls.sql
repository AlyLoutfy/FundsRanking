-- Relax RLS policies for development to unblock admin actions
-- This allows any logged-in user to update funds and ads

-- Funds
drop policy if exists "Admins can update funds" on public.funds;
create policy "Authenticated users can update funds"
  on public.funds for update
  using ( auth.role() = 'authenticated' );

-- Ads
drop policy if exists "Admins can update ads" on public.ads;
create policy "Authenticated users can update ads"
  on public.ads for update
  using ( auth.role() = 'authenticated' );
