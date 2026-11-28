-- Keep feature entitlement details private; expose only a boolean permission check to RLS.
create or replace function private.seller_has_feature(p_seller_id uuid,p_feature_key text)
returns boolean language sql stable security definer set search_path=pg_catalog,public
as $$ select exists(select 1 from public.seller_feature_access a where a.seller_id=p_seller_id and a.feature_key=p_feature_key and a.status='approved' and a.enabled=true); $$;
revoke all on function private.seller_has_feature(uuid,text) from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.seller_has_feature(uuid,text) to anon,authenticated;
drop policy if exists "Public can read approved feature access" on public.seller_feature_access;
drop policy if exists "Public reads approved active offers" on public.seller_offers;
create policy "Public reads approved active offers" on public.seller_offers for select to anon,authenticated
using(status='approved' and starts_at<=now() and ends_at>now() and private.seller_has_feature(seller_id,'offers'));
drop policy if exists "Seller creates pending offers" on public.seller_offers;
create policy "Seller creates pending offers" on public.seller_offers for insert to authenticated
with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid()) and s.verification_status='approved') and private.seller_has_feature(seller_id,'offers'));
drop policy if exists "Seller updates own pending offers" on public.seller_offers;
create policy "Seller updates own pending offers" on public.seller_offers for update to authenticated
using(status in ('pending','rejected') and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())))
with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())) and private.seller_has_feature(seller_id,'offers'));
drop policy if exists "Public reads approved active polls" on public.seller_polls;
create policy "Public reads approved active polls" on public.seller_polls for select to anon,authenticated
using(status='approved' and ends_at>now() and private.seller_has_feature(seller_id,'polls'));
drop policy if exists "Seller creates pending polls" on public.seller_polls;
create policy "Seller creates pending polls" on public.seller_polls for insert to authenticated
with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid()) and s.verification_status='approved') and private.seller_has_feature(seller_id,'polls'));
drop policy if exists "Seller updates own pending polls" on public.seller_polls;
create policy "Seller updates own pending polls" on public.seller_polls for update to authenticated
using(status in ('pending','rejected') and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())))
with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())) and private.seller_has_feature(seller_id,'polls'));
drop policy if exists "Voter inserts one vote" on public.seller_poll_votes;
create policy "Voter inserts one vote" on public.seller_poll_votes for insert to anon,authenticated
with check(option_index between 0 and 5 and exists(select 1 from public.seller_polls p where p.id=poll_id and p.status='approved' and p.ends_at>now() and option_index<jsonb_array_length(p.options)) and exists(select 1 from public.seller_polls p where p.id=poll_id and private.seller_has_feature(p.seller_id,'polls')));
drop policy if exists "Public reads approved subcategories" on public.seller_catalogue_subcategories;
create policy "Public reads approved subcategories" on public.seller_catalogue_subcategories for select to anon,authenticated
using(status='approved' and private.seller_has_feature(seller_id,'subcategories'));
drop policy if exists "Seller creates subcategory requests" on public.seller_catalogue_subcategories;
create policy "Seller creates subcategory requests" on public.seller_catalogue_subcategories for insert to authenticated
with check(status='pending' and exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid()) and s.verification_status='approved') and private.seller_has_feature(seller_id,'subcategories'));
