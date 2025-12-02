-- Fix settings table permissions and ensure data exists

-- Drop existing policies to avoid conflicts/duplicates
drop policy if exists "Public can view settings" on public.settings;
drop policy if exists "Admins can update settings" on public.settings;
drop policy if exists "Admins can insert settings" on public.settings;

-- Re-create policies
create policy "Public can view settings"
  on public.settings for select
  using ( true );

create policy "Admins can update settings"
  on public.settings for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Admins can insert settings"
  on public.settings for insert
  with check ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Ensure the ad_price row exists
insert into public.settings (key, value)
values ('ad_price', '{"amount": 10000, "currency": "EGP", "period": "month"}')
on conflict (key) do nothing;
