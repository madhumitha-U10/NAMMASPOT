-- Anonymous, privacy-conscious seller page analytics.
-- No IP address, name, phone number or full user-agent is stored.
create table if not exists public.seller_page_views (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  visitor_key uuid not null,
  source text not null default 'direct'
    check (source in ('direct','whatsapp','instagram','qr','search','other')),
  viewed_at timestamptz not null default now()
);

create index if not exists seller_page_views_seller_viewed_at_idx
  on public.seller_page_views (seller_id, viewed_at desc);
create index if not exists seller_page_views_seller_visitor_idx
  on public.seller_page_views (seller_id, visitor_key, viewed_at desc);

alter table public.seller_page_views enable row level security;

drop policy if exists "Public can record approved seller page views" on public.seller_page_views;
create policy "Public can record approved seller page views"
  on public.seller_page_views for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.sellers s
      where s.id = seller_page_views.seller_id
        and s.verification_status = 'approved'
    )
  );

drop policy if exists "Seller can read own page analytics" on public.seller_page_views;
create policy "Seller can read own page analytics"
  on public.seller_page_views for select to authenticated
  using (
    exists (
      select 1 from public.sellers s
      where s.id = seller_page_views.seller_id
        and s.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.admins a
      where a.user_id = (select auth.uid())
    )
  );

grant insert on public.seller_page_views to anon, authenticated;
grant select on public.seller_page_views to authenticated;

create or replace function public.get_seller_page_analytics(
  p_seller_id uuid,
  p_days integer default 30
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  result jsonb;
  safe_days integer := greatest(1, least(coalesce(p_days, 30), 90));
begin
  if not exists (
    select 1 from public.sellers s
    where s.id = p_seller_id and s.user_id = (select auth.uid())
  ) and not exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  ) then
    raise exception 'Not allowed to view this seller analytics';
  end if;

  with recent as (
    select visitor_key, source, viewed_at
    from public.seller_page_views
    where seller_id = p_seller_id
      and viewed_at >= now() - make_interval(days => safe_days)
  ),
  daily as (
    select viewed_at::date as day, count(*)::integer as views
    from recent group by viewed_at::date order by viewed_at::date
  ),
  sources as (
    select source, count(*)::integer as views
    from recent group by source order by count(*) desc
  )
  select jsonb_build_object(
    'total_views', (select count(*) from recent),
    'unique_visitors', (select count(distinct visitor_key) from recent),
    'today_views', (select count(*) from recent where viewed_at >= date_trunc('day', now())),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('date', day, 'views', views) order by day) from daily), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('source', source, 'views', views) order by views desc) from sources), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.get_seller_page_analytics(uuid, integer) from public, anon;
grant execute on function public.get_seller_page_analytics(uuid, integer) to authenticated;
