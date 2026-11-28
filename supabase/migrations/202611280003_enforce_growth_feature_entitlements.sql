-- Enforce Advanced Catalogue permissions even when a seller calls the Data API directly.
create or replace function private.clear_featured_products_when_advanced_catalogue_disabled()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if new.feature_key = 'advanced_catalogue'
     and (new.status <> 'approved' or new.enabled = false) then
    update public.products
    set featured = false,
        updated_at = now()
    where seller_id = new.seller_id
      and featured = true;
  end if;
  return new;
end;
$$;
revoke all on function private.clear_featured_products_when_advanced_catalogue_disabled() from public, anon, authenticated;

drop trigger if exists clear_featured_products_after_access_change on public.seller_feature_access;
create trigger clear_featured_products_after_access_change
after update of status, enabled on public.seller_feature_access
for each row
when (new.feature_key = 'advanced_catalogue')
execute function private.clear_featured_products_when_advanced_catalogue_disabled();

create or replace function private.enforce_featured_product_entitlement()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_count integer;
begin
  if new.featured is distinct from old.featured and new.featured = true then
    if not private.seller_has_feature(new.seller_id, 'advanced_catalogue') then
      raise exception 'Advanced Catalogue must be approved and switched on to feature products';
    end if;

    select count(*) into v_count
    from public.products
    where seller_id = new.seller_id
      and featured = true
      and id <> new.id;

    if v_count >= 3 then
      raise exception 'A seller can feature up to 3 products';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_featured_product_entitlement() from public, anon, authenticated;

drop trigger if exists enforce_featured_product_entitlement on public.products;
create trigger enforce_featured_product_entitlement
before update of featured on public.products
for each row
execute function private.enforce_featured_product_entitlement();
