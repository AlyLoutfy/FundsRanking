-- Add is_promoted column to funds table
alter table public.funds
add column if not exists is_promoted boolean default false;

-- Drop potential conflicting functions
drop function if exists set_promoted_fund(bigint);
drop function if exists set_promoted_fund(uuid);

-- Create function to set a single promoted fund
create or replace function set_promoted_fund(fund_id uuid)
returns void as $$
begin
  -- Reset all funds to not promoted
  update public.funds set is_promoted = false where true;
  
  -- Set the specific fund to promoted
  update public.funds set is_promoted = true where id = fund_id;
end;
$$ language plpgsql security definer;

-- Create function to clear all promoted funds
create or replace function clear_promoted_funds()
returns void as $$
begin
  update public.funds set is_promoted = false where true;
end;
$$ language plpgsql security definer;
