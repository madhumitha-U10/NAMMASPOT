create table if not exists public.seller_content_like_counts (
  target_type text not null check (target_type in ('seller','product')),
  target_id uuid not null,
  like_count bigint not null default 0 check (like_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (target_type,target_id)
);
alter table public.seller_content_like_counts enable row level security;
drop policy if exists "Public can read like totals" on public.seller_content_like_counts;
create policy "Public can read like totals" on public.seller_content_like_counts for select to anon, authenticated using (true);
grant select on public.seller_content_like_counts to anon, authenticated;
insert into public.seller_content_like_counts(target_type,target_id,like_count)
select case when seller_id is not null then 'seller' else 'product' end, coalesce(seller_id,product_id), count(*)::bigint
from public.seller_content_likes
group by case when seller_id is not null then 'seller' else 'product' end, coalesce(seller_id,product_id)
on conflict (target_type,target_id) do update set like_count=excluded.like_count,updated_at=now();
create or replace function public.maintain_seller_content_like_counts()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_type text; v_id uuid;
begin
  if TG_OP='INSERT' then
    v_type := case when NEW.seller_id is not null then 'seller' else 'product' end;
    v_id := coalesce(NEW.seller_id,NEW.product_id);
    insert into public.seller_content_like_counts(target_type,target_id,like_count) values(v_type,v_id,1)
    on conflict(target_type,target_id) do update set like_count=public.seller_content_like_counts.like_count+1,updated_at=now();
    return NEW;
  end if;
  v_type := case when OLD.seller_id is not null then 'seller' else 'product' end;
  v_id := coalesce(OLD.seller_id,OLD.product_id);
  update public.seller_content_like_counts set like_count=greatest(like_count-1,0),updated_at=now()
  where target_type=v_type and target_id=v_id;
  return OLD;
end;
$$;
revoke all on function public.maintain_seller_content_like_counts() from public,anon,authenticated;
drop trigger if exists seller_content_likes_count_insert on public.seller_content_likes;
drop trigger if exists seller_content_likes_count_delete on public.seller_content_likes;
create trigger seller_content_likes_count_insert after insert on public.seller_content_likes for each row execute function public.maintain_seller_content_like_counts();
create trigger seller_content_likes_count_delete after delete on public.seller_content_likes for each row execute function public.maintain_seller_content_like_counts();
drop function if exists public.get_public_like_counts(uuid[],uuid[]);
