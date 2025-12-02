-- Add display_order column to ads table
alter table public.ads
add column if not exists display_order integer default 0;

-- Function to reorder ads
create or replace function public.reorder_ads(ad_ids uuid[])
returns void as $$
declare
  i integer;
  ad_id uuid;
begin
  for i in 1..array_length(ad_ids, 1) loop
    ad_id := ad_ids[i];
    update public.ads
    set display_order = i
    where id = ad_id;
  end loop;
end;
$$ language plpgsql security definer;
