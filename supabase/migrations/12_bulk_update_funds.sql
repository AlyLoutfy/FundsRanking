-- Function to bulk update fund status
create or replace function public.bulk_update_fund_status(fund_ids uuid[], new_status text)
returns void as $$
begin
  update public.funds
  set status = new_status
  where id = any(fund_ids);
end;
$$ language plpgsql security definer;
