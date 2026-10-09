drop policy if exists "public read approved product images" on public.product_images;
drop policy if exists "seller manage own product images" on public.product_images;
create policy "public and owner read product images" on public.product_images
for select to anon, authenticated
using (
  exists (select 1 from public.products p join public.sellers s on s.id=p.seller_id
    where p.id=product_images.product_id and p.seller_id=product_images.seller_id and s.verification_status='approved')
  or exists (select 1 from public.sellers s join public.products p on p.seller_id=s.id
    where s.id=product_images.seller_id and s.user_id=(select auth.uid()) and p.id=product_images.product_id)
);
create policy "seller insert own product images" on public.product_images
for insert to authenticated
with check (exists (select 1 from public.sellers s join public.products p on p.seller_id=s.id
  where s.id=product_images.seller_id and s.user_id=(select auth.uid()) and p.id=product_images.product_id));
create policy "seller update own product images" on public.product_images
for update to authenticated
using (exists (select 1 from public.sellers s join public.products p on p.seller_id=s.id
  where s.id=product_images.seller_id and s.user_id=(select auth.uid()) and p.id=product_images.product_id))
with check (exists (select 1 from public.sellers s join public.products p on p.seller_id=s.id
  where s.id=product_images.seller_id and s.user_id=(select auth.uid()) and p.id=product_images.product_id));
create policy "seller delete own product images" on public.product_images
for delete to authenticated
using (exists (select 1 from public.sellers s join public.products p on p.seller_id=s.id
  where s.id=product_images.seller_id and s.user_id=(select auth.uid()) and p.id=product_images.product_id));
create index if not exists product_images_seller_id_idx on public.product_images(seller_id);
revoke execute on function public.lookup_seller_email(text,text) from authenticated;
grant execute on function public.lookup_seller_email(text,text) to anon, service_role;
drop policy if exists "seller media owner read storage guard" on public.storage_guard;
create policy "storage guard admin read" on public.storage_guard
for select to authenticated
using (exists (select 1 from public.admins a where a.user_id=(select auth.uid())));
