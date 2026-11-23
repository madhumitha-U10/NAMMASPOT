create table if not exists public.seller_notifications (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  notification_type text not null check (notification_type in ('enquiry', 'seller_like', 'product_like')),
  title text not null,
  message text not null,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists seller_notifications_seller_created_idx on public.seller_notifications (seller_id, created_at desc);
create index if not exists seller_notifications_unread_idx on public.seller_notifications (seller_id, created_at desc) where read_at is null;
alter table public.seller_notifications enable row level security;
revoke all on public.seller_notifications from anon;
grant select, update on public.seller_notifications to authenticated;
drop policy if exists "Sellers read their notifications" on public.seller_notifications;
create policy "Sellers read their notifications" on public.seller_notifications for select to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_notifications.seller_id and s.user_id = (select auth.uid())));
drop policy if exists "Sellers mark their notifications read" on public.seller_notifications;
create policy "Sellers mark their notifications read" on public.seller_notifications for update to authenticated
using (exists (select 1 from public.sellers s where s.id = seller_notifications.seller_id and s.user_id = (select auth.uid())))
with check (exists (select 1 from public.sellers s where s.id = seller_notifications.seller_id and s.user_id = (select auth.uid())));

create or replace function private.notify_seller_enquiry()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.seller_notifications (seller_id, notification_type, title, message, related_id)
  values (new.seller_id, 'enquiry', 'New customer enquiry', 'A customer sent you an enquiry. Open your dashboard to reply.', new.id);
  return new;
end; $$;

create or replace function private.notify_seller_like()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare target_seller_id uuid;
begin
  target_seller_id := new.seller_id;
  if target_seller_id is null and new.product_id is not null then
    select p.seller_id into target_seller_id from public.products p where p.id = new.product_id;
  end if;
  if target_seller_id is null then return new; end if;
  if new.user_id is not null and exists (select 1 from public.sellers s where s.id = target_seller_id and s.user_id = new.user_id) then return new; end if;
  insert into public.seller_notifications (seller_id, notification_type, title, message, related_id)
  values (target_seller_id,
    case when new.seller_id is not null then 'seller_like' else 'product_like' end,
    case when new.seller_id is not null then 'Someone liked your shop' else 'A product received a like' end,
    case when new.seller_id is not null then 'Your shop received a new like. Thank you for sharing your catalogue!' else 'One of your catalogue products received a new like.' end,
    coalesce(new.seller_id, new.product_id));
  return new;
end; $$;
revoke all on function private.notify_seller_enquiry() from public, anon, authenticated;
revoke all on function private.notify_seller_like() from public, anon, authenticated;
drop trigger if exists seller_enquiry_notification on public.enquiries;
create trigger seller_enquiry_notification after insert on public.enquiries for each row execute function private.notify_seller_enquiry();
drop trigger if exists seller_content_like_notification on public.seller_content_likes;
create trigger seller_content_like_notification after insert on public.seller_content_likes for each row execute function private.notify_seller_like();
