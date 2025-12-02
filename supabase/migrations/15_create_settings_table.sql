-- Create settings table
create table public.settings (
  key text primary key,
  value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;

-- Policy: Public can view settings
create policy "Public can view settings"
  on public.settings for select
  using ( true );

-- Policy: Admins can update settings
create policy "Admins can update settings"
  on public.settings for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Policy: Admins can insert settings (for initial setup if needed)
create policy "Admins can insert settings"
  on public.settings for insert
  with check ( 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Insert default ad price
insert into public.settings (key, value)
values ('ad_price', '{"amount": 10000, "currency": "EGP", "period": "month"}')
on conflict (key) do nothing;
