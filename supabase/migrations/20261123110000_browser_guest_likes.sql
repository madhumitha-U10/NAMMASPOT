-- Allow browser-identified guests to like public seller and product pages
-- without creating Supabase Auth users. Guest writes go only through the
-- guest-content-likes Edge Function; public table writes remain unavailable.

alter table public.seller_content_likes
  alter column user_id drop not null;

alter table public.seller_content_likes
  add column if not exists guest_id uuid;

alter table public.seller_content_likes
  add constraint seller_content_likes_identity_check
  check (
    (user_id is not null and guest_id is null)
    or
    (user_id is null and guest_id is not null)
  );

create unique index if not exists seller_content_likes_guest_seller_uidx
  on public.seller_content_likes (guest_id, seller_id)
  where guest_id is not null and seller_id is not null;

create unique index if not exists seller_content_likes_guest_product_uidx
  on public.seller_content_likes (guest_id, product_id)
  where guest_id is not null and product_id is not null;

-- Guests must never insert, update, delete, or read raw like rows directly.
revoke all on table public.seller_content_likes from anon;

create index if not exists seller_content_likes_guest_created_idx
  on public.seller_content_likes (guest_id, created_at desc)
  where guest_id is not null;
