-- Allow public to submit ads (insert permission)
create policy "Public can submit ads"
  on public.ads for insert
  with check ( true );
