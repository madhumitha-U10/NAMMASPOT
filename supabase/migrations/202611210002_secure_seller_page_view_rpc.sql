
drop policy if exists "Public can record approved seller page views" on public.seller_page_views;
revoke insert on public.seller_page_views from anon, authenticated;

create or replace function public.record_seller_page_view(
  p_seller_id uuid,
  p_visitor_key uuid,
  p_source text default 'direct'
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  clean_source text;
begin
  if p_seller_id is null or p_visitor_key is null then
    return false;
  end if;

  clean_source := lower(coalesce(p_source, 'direct'));
  if clean_source not in ('direct','whatsapp','instagram','qr','search') then
    clean_source := 'other';
  end if;

  if not exists (
    select 1 from public.sellers s
    where s.id = p_seller_id and s.verification_status = 'approved'
  ) then
    return false;
  end if;

  if exists (
    select 1 from public.seller_page_views v
    where v.seller_id = p_seller_id
      and v.visitor_key = p_visitor_key
      and v.viewed_at >= now() - interval '30 minutes'
  ) then
    return false;
  end if;

  insert into public.seller_page_views (seller_id, visitor_key, source)
  values (p_seller_id, p_visitor_key, clean_source);

  return true;
end;
$$;

revoke all on function public.record_seller_page_view(uuid, uuid, text) from public;
grant execute on function public.record_seller_page_view(uuid, uuid, text) to anon, authenticated;
