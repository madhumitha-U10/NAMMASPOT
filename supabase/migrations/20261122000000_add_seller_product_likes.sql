create table if not exists public.seller_content_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint seller_content_likes_one_target check (
    (seller_id is not null and product_id is null) or
    (seller_id is null and product_id is not null)
  )
);
create unique index if not exists seller_content_likes_user_seller_uidx on public.seller_content_likes(user_id,seller_id) where seller_id is not null;
create unique index if not exists seller_content_likes_user_product_uidx on public.seller_content_likes(user_id,product_id) where product_id is not null;
create index if not exists seller_content_likes_seller_idx on public.seller_content_likes(seller_id) where seller_id is not null;
create index if not exists seller_content_likes_product_idx on public.seller_content_likes(product_id) where product_id is not null;
alter table public.seller_content_likes enable row level security;
drop policy if exists "Users can view own likes" on public.seller_content_likes;
create policy "Users can view own likes" on public.seller_content_likes for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can add own likes" on public.seller_content_likes;
create policy "Users can add own likes" on public.seller_content_likes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can remove own likes" on public.seller_content_likes;
create policy "Users can remove own likes" on public.seller_content_likes for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.seller_content_likes to authenticated;
create or replace function public.get_public_like_counts(p_seller_ids uuid[] default '{}', p_product_ids uuid[] default '{}')
returns table(seller_id uuid, product_id uuid, like_count bigint)
language sql stable security definer set search_path = public
as $$
  select l.seller_id, l.product_id, count(*)::bigint
  from public.seller_content_likes l
  where (l.seller_id is not null and l.seller_id = any(coalesce(p_seller_ids,'{}'::uuid[])))
     or (l.product_id is not null and l.product_id = any(coalesce(p_product_ids,'{}'::uuid[])))
  group by l.seller_id, l.product_id;
$$;
revoke all on function public.get_public_like_counts(uuid[],uuid[]) from public;
grant execute on function public.get_public_like_counts(uuid[],uuid[]) to anon, authenticated;
