-- NammaSpot storage safety guard
-- Keeps seller-media below a 90% warning / 90% critical / 90%+ safety cutoff.
-- Supabase Free Storage quota is 1 GiB; this migration uses a 900 MiB hard cutoff.

create schema if not exists private;

create table if not exists public.storage_usage (
  id boolean primary key default true check (id = true),
  used_bytes bigint not null default 0 check (used_bytes >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.storage_guard (
  id boolean primary key default true check (id = true),
  used_bytes bigint not null default 0 check (used_bytes >= 0),
  updated_at timestamptz not null default now()
);

alter table public.storage_usage enable row level security;
alter table public.storage_guard enable row level security;

drop policy if exists "Admins can read storage usage" on public.storage_usage;
create policy "Admins can read storage usage"
on public.storage_usage for select to authenticated
using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Authenticated users can read storage guard" on public.storage_guard;
create policy "Authenticated users can read storage guard"
on public.storage_guard for select to authenticated using (true);

insert into public.storage_usage(id,used_bytes,updated_at)
values(true,coalesce((select sum((metadata->>'size')::bigint) from storage.objects where bucket_id='seller-media'),0),now())
on conflict(id) do update set used_bytes=excluded.used_bytes,updated_at=excluded.updated_at;

insert into public.storage_guard(id,used_bytes,updated_at)
values(true,coalesce((select sum((metadata->>'size')::bigint) from storage.objects where bucket_id='seller-media'),0),now())
on conflict(id) do update set used_bytes=excluded.used_bytes,updated_at=excluded.updated_at;

create or replace function private.refresh_nammaspot_storage_usage()
returns trigger
language plpgsql
security definer
set search_path = public, storage, pg_temp
as $$
declare u bigint;
begin
  select coalesce(sum((metadata->>'size')::bigint),0) into u
  from storage.objects where bucket_id='seller-media';

  insert into public.storage_usage(id,used_bytes,updated_at) values(true,u,now())
  on conflict(id) do update set used_bytes=excluded.used_bytes,updated_at=excluded.updated_at;

  insert into public.storage_guard(id,used_bytes,updated_at) values(true,u,now())
  on conflict(id) do update set used_bytes=excluded.used_bytes,updated_at=excluded.updated_at;

  return coalesce(new,old);
end;
$$;

create or replace function private.enforce_nammaspot_storage_quota()
returns trigger
language plpgsql
security definer
set search_path = public, storage, pg_temp
as $$
declare
  used_bytes bigint;
  incoming_bytes bigint;
  quota_bytes bigint := 966367641;
begin
  if new.bucket_id <> 'seller-media' then return new; end if;

  incoming_bytes := greatest(coalesce((new.metadata->>'size')::bigint,0),0);

  if tg_op = 'INSERT' then
    select coalesce(sum((metadata->>'size')::bigint),0) into used_bytes
    from storage.objects where bucket_id='seller-media';
  else
    select coalesce(sum((metadata->>'size')::bigint),0)
      - greatest(coalesce((old.metadata->>'size')::bigint,0),0)
      into used_bytes
    from storage.objects where bucket_id='seller-media';
  end if;

  if used_bytes + incoming_bytes > quota_bytes then
    raise exception 'NammaSpot storage safety cutoff reached. New image uploads are temporarily paused.';
  end if;

  return new;
end;
$$;

drop trigger if exists nammaspot_storage_quota_guard on storage.objects;
create trigger nammaspot_storage_quota_guard
before insert or update on storage.objects
for each row execute function private.enforce_nammaspot_storage_quota();

drop trigger if exists nammaspot_storage_usage_refresh on storage.objects;
create trigger nammaspot_storage_usage_refresh
after insert or update or delete on storage.objects
for each row execute function private.refresh_nammaspot_storage_usage();

create or replace function public.storage_upload_allowed(p_bytes bigint)
returns boolean
language sql
security invoker
set search_path = public
as $$
  select coalesce(used_bytes,0) + greatest(coalesce(p_bytes,0),0) <= 966367641
  from public.storage_guard where id=true;
$$;

create or replace function public.admin_storage_usage()
returns table(used_bytes bigint, quota_bytes bigint, warning_bytes bigint, critical_bytes bigint, cutoff_bytes bigint, used_percent numeric, status text)
language sql
security invoker
set search_path = public
as $$
  select used_bytes,1073741824::bigint,858993459::bigint,966367641::bigint,1017118720::bigint,
    round((used_bytes::numeric/1073741824::numeric)*100,2),
    case when used_bytes>=1017118720 then 'blocked'
         when used_bytes>=966367641 then 'critical'
         when used_bytes>=858993459 then 'warning'
         else 'ok' end
  from public.storage_usage where id=true;
$$;

revoke execute on function public.storage_upload_allowed(bigint) from public, anon, authenticated;
grant execute on function public.storage_upload_allowed(bigint) to authenticated;
revoke execute on function public.admin_storage_usage() from public, anon, authenticated;
grant execute on function public.admin_storage_usage() to authenticated;
