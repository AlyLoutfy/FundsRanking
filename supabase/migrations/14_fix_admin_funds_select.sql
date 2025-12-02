-- Allow admins to view ALL funds (including hidden ones)
create policy "Admins can view all funds"
  on public.funds for select
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );
