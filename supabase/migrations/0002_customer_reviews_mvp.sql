-- NammaSpot customer reviews MVP: private contact data, public approved reviews, admin moderation.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  reviewer_name text not null check (length(trim(reviewer_name)) between 2 and 80),
  reviewer_contact text not null check (length(trim(reviewer_contact)) between 5 and 160),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) between 5 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_seller_status_created_idx
  on public.reviews (seller_id, status, created_at desc);
create unique index if not exists reviews_seller_contact_unique
  on public.reviews (seller_id, lower(btrim(reviewer_contact)));

alter table public.reviews enable row level security;

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select to anon, authenticated
  using (status = 'approved' or (auth.role() = 'authenticated' and public.is_admin()));

drop policy if exists reviews_public_insert on public.reviews;
create policy reviews_public_insert on public.reviews
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and exists (
      select 1 from public.sellers s
      where s.id = seller_id and s.verification_status = 'approved'
    )
  );

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Column-level grants ensure reviewer_contact is never readable through the public API.
revoke all on public.reviews from anon, authenticated;
grant insert (seller_id, reviewer_name, reviewer_contact, rating, comment, status)
  on public.reviews to anon, authenticated;
grant select (id, seller_id, reviewer_name, rating, comment, status, created_at)
  on public.reviews to anon, authenticated;
grant update (status) on public.reviews to authenticated;

create or replace view public.public_reviews
with (security_invoker = true)
as
select id, seller_id, reviewer_name, rating, comment, created_at
from public.reviews
where status = 'approved';

grant select on public.public_reviews to anon, authenticated;
