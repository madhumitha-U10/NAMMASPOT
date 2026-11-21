alter table public.seller_website_settings
  add column if not exists appointment_duration_minutes integer not null default 60
  check (appointment_duration_minutes in (30, 45, 60, 90, 120));

create table if not exists public.service_appointments (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  service_name text not null check (char_length(service_name) between 1 and 120),
  appointment_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_contact text not null check (char_length(customer_contact) between 8 and 20),
  customer_note text check (char_length(coalesce(customer_note, '')) <= 1000),
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists service_appointments_seller_date_idx
  on public.service_appointments (seller_id, appointment_date, start_time);
create index if not exists service_appointments_active_idx
  on public.service_appointments (seller_id, appointment_date, start_time)
  where status in ('pending','confirmed');

alter table public.service_appointments enable row level security;
revoke all on public.service_appointments from anon, authenticated;
grant select on public.service_appointments to authenticated;
grant update (status, updated_at) on public.service_appointments to authenticated;

drop policy if exists "service appointments owner read" on public.service_appointments;
create policy "service appointments owner read"
on public.service_appointments for select to authenticated
using (
  exists (select 1 from public.sellers s where s.id = service_appointments.seller_id and s.user_id = (select auth.uid()))
  or exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

drop policy if exists "service appointments owner update" on public.service_appointments;
create policy "service appointments owner update"
on public.service_appointments for update to authenticated
using (
  exists (select 1 from public.sellers s where s.id = service_appointments.seller_id and s.user_id = (select auth.uid()))
  or exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.sellers s where s.id = service_appointments.seller_id and s.user_id = (select auth.uid()))
  or exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
);

create or replace function public.get_public_service_slots(p_seller_id uuid, p_date date)
returns table(start_time time, end_time time)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_duration integer;
  v_ranges jsonb := '[]'::jsonb;
  v_special_found boolean := false;
  v_is_closed boolean := false;
  v_weekly_open boolean := false;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_now_local timestamp without time zone := now() at time zone 'Asia/Kolkata';
  v_range record;
  v_range_start timestamp without time zone;
  v_range_end timestamp without time zone;
  v_slot_start timestamp without time zone;
begin
  if p_seller_id is null or p_date is null or p_date < v_today or p_date > v_today + 60 then return; end if;

  select coalesce(w.appointment_duration_minutes, 60)
    into v_duration
  from public.sellers s
  join public.seller_website_settings w on w.seller_id = s.id
  where s.id = p_seller_id
    and s.verification_status = 'approved'
    and nullif(btrim(coalesce(w.services, '')), '') is not null;
  if not found then return; end if;

  select d.is_closed, d.ranges into v_is_closed, v_ranges
  from public.seller_special_dates d
  where d.seller_id = p_seller_id and d.special_date = p_date
  limit 1;
  v_special_found := found;

  if v_special_found and v_is_closed then return; end if;
  if v_special_found and jsonb_array_length(coalesce(v_ranges, '[]'::jsonb)) = 0 then
    v_special_found := false;
  end if;

  if not v_special_found then
    select h.is_open, h.ranges into v_weekly_open, v_ranges
    from public.seller_business_hours h
    where h.seller_id = p_seller_id
      and h.day_of_week = extract(dow from p_date)::smallint
    limit 1;
    if not found or not coalesce(v_weekly_open, false) then return; end if;
  end if;

  for v_range in select value from jsonb_array_elements(coalesce(v_ranges, '[]'::jsonb))
  loop
    begin
      v_range_start := p_date + (v_range.value->>'open')::time;
      v_range_end := p_date + (v_range.value->>'close')::time;
    exception when others then
      continue;
    end;
    if v_range_end <= v_range_start then continue; end if;

    for v_slot_start in
      select generate_series(v_range_start, v_range_end - make_interval(mins => v_duration), make_interval(mins => v_duration))
    loop
      if p_date = v_today and v_slot_start <= v_now_local then continue; end if;
      if not exists (
        select 1 from public.service_appointments a
        where a.seller_id = p_seller_id
          and a.appointment_date = p_date
          and a.status in ('pending', 'confirmed')
          and a.start_time < (v_slot_start::time + make_interval(mins => v_duration))
          and a.end_time > v_slot_start::time
      ) then
        start_time := v_slot_start::time;
        end_time := (v_slot_start + make_interval(mins => v_duration))::time;
        return next;
      end if;
    end loop;
  end loop;
end;
$$;

create or replace function public.get_public_service_calendar(p_seller_id uuid, p_from_date date, p_to_date date)
returns table(available_date date, available_slots integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_date date;
  v_count integer;
begin
  if p_seller_id is null or p_from_date is null or p_to_date is null
    or p_to_date < p_from_date or p_to_date > p_from_date + 62 then
    raise exception 'Choose a calendar range of up to 62 days';
  end if;
  for v_date in select generate_series(p_from_date, p_to_date, interval '1 day')::date
  loop
    select count(*)::integer into v_count
    from public.get_public_service_slots(p_seller_id, v_date);
    if v_count > 0 then
      available_date := v_date;
      available_slots := v_count;
      return next;
    end if;
  end loop;
end;
$$;

create or replace function public.create_service_appointment(
  p_seller_id uuid,
  p_service_name text,
  p_appointment_date date,
  p_start_time time,
  p_customer_name text,
  p_customer_contact text,
  p_customer_note text default ''
)
returns table(id uuid, status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_service text := btrim(coalesce(p_service_name, ''));
  v_name text := btrim(coalesce(p_customer_name, ''));
  v_contact text := btrim(coalesce(p_customer_contact, ''));
  v_note text := btrim(coalesce(p_customer_note, ''));
  v_duration integer;
  v_id uuid;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_recent_count integer;
begin
  if p_seller_id is null then raise exception 'Choose a service provider'; end if;
  if length(v_name) < 2 or length(v_name) > 120 then raise exception 'Enter your name (2 to 120 characters)'; end if;
  if length(v_contact) < 8 or length(v_contact) > 20 or v_contact !~ '^[0-9+() -]+$' then raise exception 'Enter a valid phone number'; end if;
  if length(v_note) > 1000 then raise exception 'Your note is too long'; end if;
  if length(v_service) < 1 or length(v_service) > 120 then raise exception 'Choose a service'; end if;
  if p_appointment_date is null or p_appointment_date < v_today or p_appointment_date > v_today + 60 then
    raise exception 'Choose a date within the next 60 days';
  end if;
  if p_start_time is null then raise exception 'Choose an available time'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_seller_id::text || ':' || p_appointment_date::text, 0));

  if not exists (
    select 1 from public.sellers s
    join public.seller_website_settings w on w.seller_id = s.id
    where s.id = p_seller_id and s.verification_status = 'approved'
      and exists (
        select 1
        from regexp_split_to_table(coalesce(w.services, ''), E'[\\n,;]+') as service_item(value)
        where lower(btrim(service_item.value)) = lower(v_service)
      )
  ) then
    raise exception 'This service is not currently available for booking';
  end if;

  select coalesce(w.appointment_duration_minutes, 60) into v_duration
  from public.seller_website_settings w where w.seller_id = p_seller_id;

  if not exists (
    select 1 from public.get_public_service_slots(p_seller_id, p_appointment_date) slot
    where slot.start_time = p_start_time
  ) then
    raise exception 'That time is no longer available. Please choose another slot.';
  end if;

  select count(*)::integer into v_recent_count
  from public.service_appointments a
  where a.seller_id = p_seller_id and a.customer_contact = v_contact
    and a.created_at > now() - interval '24 hours' and a.status <> 'declined';
  if v_recent_count >= 5 then
    raise exception 'Too many requests were sent recently. Please contact the provider directly.';
  end if;

  insert into public.service_appointments (
    seller_id, service_name, appointment_date, start_time, end_time,
    customer_name, customer_contact, customer_note, status
  )
  values (
    p_seller_id, v_service, p_appointment_date, p_start_time,
    p_start_time + make_interval(mins => v_duration),
    v_name, v_contact, nullif(v_note, ''), 'pending'
  )
  returning service_appointments.id into v_id;

  return query select v_id, 'pending'::text;
end;
$$;

revoke all on function public.get_public_service_slots(uuid, date) from public;
revoke all on function public.get_public_service_calendar(uuid, date, date) from public;
revoke all on function public.create_service_appointment(uuid, text, date, time, text, text, text) from public;
grant execute on function public.get_public_service_slots(uuid, date) to anon, authenticated;
grant execute on function public.get_public_service_calendar(uuid, date, date) to anon, authenticated;
grant execute on function public.create_service_appointment(uuid, text, date, time, text, text, text) to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'service_appointments'
  ) then
    alter publication supabase_realtime add table public.service_appointments;
  end if;
end $$;
