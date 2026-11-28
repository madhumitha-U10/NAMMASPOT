-- Seller Growth self-service: one atomic request, seller-controlled activation, immediate seller publishing.
create or replace function public.seller_request_growth_bundle()
returns void language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_seller_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select s.id into v_seller_id from public.sellers s
  where s.user_id = auth.uid() and s.verification_status = 'approved' limit 1;
  if v_seller_id is null then raise exception 'An approved seller account is required' using errcode = '42501'; end if;

  insert into public.seller_feature_access(seller_id, feature_key, status, enabled, requested_at)
  select v_seller_id, feature_key, 'pending', false, now()
  from unnest(array['offers','polls','subcategories','advanced_catalogue']::text[]) as feature_key
  on conflict (seller_id, feature_key) do update
    set status = 'pending', enabled = false, requested_at = now(),
        reviewed_at = null, reviewed_by = null, review_note = '', updated_at = now()
    where public.seller_feature_access.status in ('not_requested','rejected','suspended');
end;
$$;
revoke all on function public.seller_request_growth_bundle() from public, anon;
grant execute on function public.seller_request_growth_bundle() to authenticated;

create or replace function public.admin_approve_seller_growth_bundle(p_seller_id uuid, p_note text default '')
returns integer language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_updated integer;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.seller_feature_access
  set status = 'approved', enabled = false, reviewed_at = now(), reviewed_by = auth.uid(),
      review_note = left(coalesce(p_note, ''), 500), updated_at = now()
  where seller_id = p_seller_id and status = 'pending';
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;
revoke all on function public.admin_approve_seller_growth_bundle(uuid,text) from public, anon;
grant execute on function public.admin_approve_seller_growth_bundle(uuid,text) to authenticated;

create or replace function public.seller_set_growth_feature_enabled(p_feature_key text, p_enabled boolean)
returns void language plpgsql security definer set search_path = pg_catalog, public, private
as $$
declare v_seller_id uuid; v_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_feature_key not in ('offers','polls','subcategories','advanced_catalogue') then raise exception 'Invalid growth feature'; end if;
  select s.id into v_seller_id from public.sellers s
  where s.user_id = auth.uid() and s.verification_status = 'approved' limit 1;
  if v_seller_id is null then raise exception 'An approved seller account is required' using errcode = '42501'; end if;
  select a.status into v_status from public.seller_feature_access a
  where a.seller_id = v_seller_id and a.feature_key = p_feature_key for update;
  if v_status is distinct from 'approved' then raise exception 'This feature has not been approved for your shop'; end if;
  update public.seller_feature_access set enabled = p_enabled, updated_at = now()
  where seller_id = v_seller_id and feature_key = p_feature_key and status = 'approved';
end;
$$;
revoke all on function public.seller_set_growth_feature_enabled(text,boolean) from public, anon;
grant execute on function public.seller_set_growth_feature_enabled(text,boolean) to authenticated;

create or replace function public.seller_set_product_featured(p_product_id uuid, p_featured boolean)
returns void language plpgsql security definer set search_path = pg_catalog, public, private
as $$
declare v_seller_id uuid; v_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select s.id into v_seller_id from public.sellers s
  join public.products p on p.seller_id = s.id
  where p.id = p_product_id and s.user_id = auth.uid() and s.verification_status = 'approved' limit 1;
  if v_seller_id is null then raise exception 'Product not found for this seller'; end if;
  if not private.seller_has_feature(v_seller_id, 'advanced_catalogue') then
    raise exception 'Turn on Featured Products after admin approval to feature products';
  end if;
  if p_featured then
    select count(*) into v_count from public.products
    where seller_id = v_seller_id and featured = true and id <> p_product_id;
    if v_count >= 3 then raise exception 'You can feature up to 3 products. Unfeature one first.'; end if;
  end if;
  update public.products set featured = p_featured, updated_at = now()
  where id = p_product_id and seller_id = v_seller_id;
end;
$$;
revoke all on function public.seller_set_product_featured(uuid,boolean) from public, anon;
grant execute on function public.seller_set_product_featured(uuid,boolean) to authenticated;

drop policy if exists "Seller creates pending offers" on public.seller_offers;
drop policy if exists "Seller updates own pending offers" on public.seller_offers;
create policy "Seller creates active offers" on public.seller_offers for insert to authenticated
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()) and s.verification_status = 'approved')
  and private.seller_has_feature(seller_id, 'offers'));
create policy "Seller updates own active offers" on public.seller_offers for update to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'offers'))
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'offers'));
create policy "Seller deletes own offers" on public.seller_offers for delete to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid())));

drop policy if exists "Seller creates pending polls" on public.seller_polls;
drop policy if exists "Seller updates own pending polls" on public.seller_polls;
create policy "Seller creates active polls" on public.seller_polls for insert to authenticated
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()) and s.verification_status = 'approved')
  and private.seller_has_feature(seller_id, 'polls'));
create policy "Seller updates own active polls" on public.seller_polls for update to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'polls'))
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'polls'));
create policy "Seller deletes own polls" on public.seller_polls for delete to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid())));

drop policy if exists "Seller creates subcategory requests" on public.seller_catalogue_subcategories;
create policy "Seller creates active subcategories" on public.seller_catalogue_subcategories for insert to authenticated
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()) and s.verification_status = 'approved')
  and private.seller_has_feature(seller_id, 'subcategories'));
create policy "Seller updates own subcategories" on public.seller_catalogue_subcategories for update to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'subcategories'))
with check (status = 'approved'
  and exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  and private.seller_has_feature(seller_id, 'subcategories'));
create policy "Seller deletes own subcategories" on public.seller_catalogue_subcategories for delete to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = (select auth.uid())));
