-- Let sellers assign catalogue products to their own approved sections.
alter table public.products
  add column if not exists subcategory_id uuid
  references public.seller_catalogue_subcategories(id) on delete set null;

create index if not exists products_seller_subcategory_idx
  on public.products(seller_id, subcategory_id);

create or replace function private.validate_product_subcategory()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare v_owner uuid; v_status text;
begin
  if new.subcategory_id is null then return new; end if;
  if tg_op = 'UPDATE' and new.subcategory_id is not distinct from old.subcategory_id
     and new.seller_id is not distinct from old.seller_id then
    return new;
  end if;

  select c.seller_id, c.status into v_owner, v_status
  from public.seller_catalogue_subcategories c
  where c.id = new.subcategory_id;

  if v_owner is distinct from new.seller_id or v_status is distinct from 'approved' then
    raise exception 'Choose an active catalogue section belonging to your shop';
  end if;
  if not private.seller_has_feature(new.seller_id, 'subcategories') then
    raise exception 'Catalogue Sections must be approved and switched on';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_product_subcategory() from public, anon, authenticated;

drop trigger if exists validate_product_subcategory on public.products;
create trigger validate_product_subcategory
before insert or update of subcategory_id, seller_id on public.products
for each row execute function private.validate_product_subcategory();
