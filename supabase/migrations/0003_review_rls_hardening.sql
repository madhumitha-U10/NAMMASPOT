-- Separate anonymous public reads from administrator reads; do not expose the
-- SECURITY DEFINER membership helper as an anonymous RPC.
drop policy if exists reviews_public_read on public.reviews;
drop policy if exists reviews_anon_read on public.reviews;
create policy reviews_anon_read on public.reviews
  for select to anon using (status = 'approved');
drop policy if exists reviews_authenticated_read on public.reviews;
create policy reviews_authenticated_read on public.reviews
  for select to authenticated
  using (status = 'approved' or public.is_admin());
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
