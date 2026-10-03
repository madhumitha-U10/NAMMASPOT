create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text unique,
  phone text unique,
  role text not null default 'customer' check (role in ('customer','seller','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories(name) values
  ('Handmade'),('Food'),('Fashion'),('Accessories'),('Gifts'),
  ('Home Decor'),('Jewellery'),('Beauty'),('Services'),
  ('Bakery'),('Mehendi'),('Crochet'),('Makeup'),('Art')
on conflict (name) do nothing;

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  slug text not null unique,
  business_name text not null check (length(trim(business_name)) between 1 and 160),
  owner_name text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  location text not null default '',
  location_url text not null default '',
  city text not null default 'Chennai',
  description text not null default '' check (length(description) <= 600),
  contact text not null default '',
  whatsapp_phone text not null default '',
  instagram_url text not null default '',
  profile_image_url text,
  cover_image_url text,
  opening_time time,
  closing_time time,
  featured boolean not null default false,
  verified boolean not null default false,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_name text not null check (length(trim(product_name)) between 1 and 160),
  description text not null default '' check (length(description) <= 1000),
  price numeric(12,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  availability boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  customer_name text not null check (length(trim(customer_name)) between 1 and 120),
  customer_contact text not null check (length(trim(customer_contact)) between 3 and 160),
  message text not null check (length(trim(message)) between 1 and 1000),
  enquiry_date timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending','viewed','responded','closed')),
  updated_at timestamptz not null default now()
);

create table if not exists public.favourites (
  user_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, seller_id)
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null default '',
  email text unique,
  created_at timestamptz not null default now()
);

create index if not exists sellers_status_idx on public.sellers(verification_status);
create index if not exists sellers_category_idx on public.sellers(category_id);
create index if not exists sellers_slug_idx on public.sellers(slug);
create index if not exists products_seller_idx on public.products(seller_id);
create index if not exists enquiries_seller_status_idx on public.enquiries(seller_id,status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists sellers_set_updated_at on public.sellers;
create trigger sellers_set_updated_at before update on public.sellers
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists(select 1 from public.admins where user_id = auth.uid());
$fn$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  requested_role text := case
    when new.raw_user_meta_data->>'role' = 'seller' then 'seller'
    else 'customer'
  end;
  requested_category text := nullif(trim(new.raw_user_meta_data->>'category_name'),'');
  category_uuid uuid;
  business text;
  slug_base text;
begin
  insert into public.users(id,name,email,phone,role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone',''),
    requested_role
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role;

  if requested_role = 'seller' then
    select id into category_uuid from public.categories where name = requested_category limit 1;
    business := coalesce(nullif(trim(new.raw_user_meta_data->>'business_name'),''),'Local Seller');
    slug_base := regexp_replace(lower(business), '[^a-z0-9]+', '-', 'g');
    slug_base := trim(both '-' from slug_base);
    if slug_base = '' then slug_base := 'local-seller'; end if;

    insert into public.sellers(
      user_id,slug,business_name,owner_name,category_id,location,location_url,
      description,contact,whatsapp_phone,instagram_url,verification_status
    )
    values (
      new.id,
      slug_base || '-' || substr(replace(new.id::text,'-',''),1,8),
      business,
      coalesce(new.raw_user_meta_data->>'name',''),
      category_uuid,
      coalesce(new.raw_user_meta_data->>'location',''),
      coalesce(new.raw_user_meta_data->>'location_url',''),
      coalesce(new.raw_user_meta_data->>'description',''),
      coalesce(new.raw_user_meta_data->>'phone',''),
      coalesce(new.raw_user_meta_data->>'whatsapp_phone',''),
      coalesce(new.raw_user_meta_data->>'instagram_url',''),
      'pending'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.apply_seller_verification()
returns trigger
language plpgsql
as $fn$
begin
  new.verified := new.verification_status = 'approved';
  return new;
end;
$fn$;

drop trigger if exists sellers_apply_verification on public.sellers;
create trigger sellers_apply_verification
before insert or update of verification_status on public.sellers
for each row execute function public.apply_seller_verification();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;
alter table public.favourites enable row level security;
alter table public.admins enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated
using (true);

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories for insert to authenticated
with check (public.is_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update on public.categories for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories for delete to authenticated
using (public.is_admin());

drop policy if exists sellers_public_read on public.sellers;
create policy sellers_public_read on public.sellers for select to anon, authenticated
using (verification_status = 'approved' or user_id = auth.uid() or public.is_admin());

drop policy if exists sellers_owner_update on public.sellers;
create policy sellers_owner_update on public.sellers for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists sellers_owner_insert on public.sellers;
create policy sellers_owner_insert on public.sellers for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists sellers_admin_delete on public.sellers;
create policy sellers_admin_delete on public.sellers for delete to authenticated
using (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
using (
  exists (
    select 1 from public.sellers s
    where s.id = seller_id
      and (s.verification_status = 'approved' or s.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert on public.products for insert to authenticated
with check (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists products_owner_update on public.products;
create policy products_owner_update on public.products for update to authenticated
using (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
)
with check (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists products_owner_delete on public.products;
create policy products_owner_delete on public.products for delete to authenticated
using (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert to anon, authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and exists(
    select 1 from public.sellers s
    where s.id = seller_id and s.verification_status = 'approved'
  )
  and (
    product_id is null
    or exists(
      select 1 from public.products p
      where p.id = product_id and p.seller_id = seller_id
    )
  )
);

drop policy if exists enquiries_owner_read on public.enquiries;
create policy enquiries_owner_read on public.enquiries for select to authenticated
using (
  user_id = auth.uid()
  or exists(select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())
  or public.is_admin()
);

drop policy if exists enquiries_owner_update on public.enquiries;
create policy enquiries_owner_update on public.enquiries for update to authenticated
using (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
)
with check (
  exists(select 1 from public.sellers s where s.id = seller_id and (s.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists favourites_owner_all on public.favourites;
create policy favourites_owner_all on public.favourites for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists admins_select_own on public.admins;
create policy admins_select_own on public.admins for select to authenticated
using (user_id = auth.uid() or public.is_admin());

insert into storage.buckets(id,name,public)
values ('seller-media','seller-media',true)
on conflict (id) do update set public = true;

drop policy if exists seller_media_public_read on storage.objects;
create policy seller_media_public_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'seller-media');

drop policy if exists seller_media_owner_insert on storage.objects;
create policy seller_media_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'seller-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists seller_media_owner_update on storage.objects;
create policy seller_media_owner_update on storage.objects
for update to authenticated
using (
  bucket_id = 'seller-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'seller-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists seller_media_owner_delete on storage.objects;
create policy seller_media_owner_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'seller-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);