create or replace function public.admin_platform_activity()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'total_likes', (select count(*) from public.seller_content_likes),
    'total_enquiries', (select count(*) from public.enquiries),
    'new_enquiries', (select count(*) from public.enquiries where status in ('new','pending')),
    'views_30d', (select count(*) from public.seller_page_views where viewed_at >= now() - interval '30 days')
  );
end;
$$;
revoke all on function public.admin_platform_activity() from public, anon;
grant execute on function public.admin_platform_activity() to authenticated;