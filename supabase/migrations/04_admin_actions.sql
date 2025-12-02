-- Create secure functions to bypass RLS for admin actions
-- These functions run with the privileges of the creator (postgres), bypassing RLS policies.

-- Function to toggle fund status
create or replace function public.toggle_fund_status(fund_id uuid, new_status text)
returns void as $$
begin
  update public.funds
  set status = new_status
  where id = fund_id;
end;
$$ language plpgsql security definer;

-- Function to toggle ad status
create or replace function public.toggle_ad_status(ad_id uuid, new_status text)
returns void as $$
begin
  update public.ads
  set status = new_status
  where id = ad_id;
end;
$$ language plpgsql security definer;
