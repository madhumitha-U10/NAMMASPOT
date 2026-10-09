-- Harden cross-seller product image ownership and rate-limit public enquiries.
drop policy if exists "storage guard authenticated read" on public.storage_guard;
drop policy if exists "seller media owner read storage guard" on public.storage_guard;
create policy "seller media owner read storage guard" on public.storage_guard
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "public read approved product images" on public.product_images;
create policy "public read approved product images" on public.product_images
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_images.product_id
        and p.seller_id = product_images.seller_id
        and s.id = product_images.seller_id
        and s.verification_status = 'approved'
    )
  );

drop policy if exists "seller manage own product images" on public.product_images;
create policy "seller manage own product images" on public.product_images
  for all to authenticated
  using (
    exists (
      select 1 from public.sellers s
      join public.products p on p.seller_id = s.id
      where s.id = product_images.seller_id
        and s.user_id = (select auth.uid())
        and p.id = product_images.product_id
    )
  )
  with check (
    exists (
      select 1 from public.sellers s
      join public.products p on p.seller_id = s.id
      where s.id = product_images.seller_id
        and s.user_id = (select auth.uid())
        and p.id = product_images.product_id
    )
  );

create table if not exists private.enquiry_rate_limits (
  id bigint generated always as identity primary key,
  contact_hash text not null,
  seller_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists enquiry_rate_limits_contact_time_idx on private.enquiry_rate_limits (contact_hash, created_at desc);
create index if not exists enquiry_rate_limits_seller_time_idx on private.enquiry_rate_limits (seller_id, created_at desc);
alter table private.enquiry_rate_limits enable row level security;
revoke all on table private.enquiry_rate_limits from public, anon, authenticated;

create or replace function private.limit_public_enquiries()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare
  v_contact_hash text;
  v_contact_count integer;
  v_seller_count integer;
begin
  if new.customer_name is null or length(btrim(new.customer_name)) = 0
     or new.customer_contact is null or length(btrim(new.customer_contact)) = 0 then
    raise exception 'Name and contact details are required for an enquiry';
  end if;
  v_contact_hash := md5(lower(btrim(new.customer_contact)));
  perform pg_advisory_xact_lock(hashtext(v_contact_hash));
  perform pg_advisory_xact_lock(hashtext(new.seller_id::text));
  select count(*)::integer into v_contact_count from private.enquiry_rate_limits r
    where r.contact_hash = v_contact_hash and r.created_at > now() - interval '15 minutes';
  if v_contact_count >= 10 then raise exception 'Too many enquiries from this contact. Please try again later'; end if;
  select count(*)::integer into v_seller_count from private.enquiry_rate_limits r
    where r.seller_id = new.seller_id and r.created_at > now() - interval '1 hour';
  if v_seller_count >= 60 then raise exception 'This seller has received many enquiries. Please try again later'; end if;
  insert into private.enquiry_rate_limits(contact_hash, seller_id, created_at) values (v_contact_hash, new.seller_id, now());
  delete from private.enquiry_rate_limits where created_at < now() - interval '24 hours';
  return new;
end;
$function$;
revoke all on function private.limit_public_enquiries() from public, anon, authenticated;
drop trigger if exists limit_public_enquiries_before_insert on public.enquiries;
create trigger limit_public_enquiries_before_insert before insert on public.enquiries
for each row execute function private.limit_public_enquiries();
revoke execute on function public.email_in_use(text) from public, anon, authenticated;
grant execute on function public.email_in_use(text) to service_role;
