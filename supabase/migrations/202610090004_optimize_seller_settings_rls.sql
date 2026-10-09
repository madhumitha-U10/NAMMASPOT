-- Consolidate overlapping seller-settings RLS policies without widening access.
drop policy if exists "public read approved seller hours" on public.seller_business_hours;
drop policy if exists "seller manage own hours" on public.seller_business_hours;
create policy "read approved or own seller hours" on public.seller_business_hours for select to anon, authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_business_hours.seller_id and (
    s.verification_status='approved' or s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))
  ))
);
create policy "seller insert own hours" on public.seller_business_hours for insert to authenticated with check (
  exists (select 1 from public.sellers s where s.id=seller_business_hours.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller update own hours" on public.seller_business_hours for update to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_business_hours.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
) with check (
  exists (select 1 from public.sellers s where s.id=seller_business_hours.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller delete own hours" on public.seller_business_hours for delete to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_business_hours.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);

drop policy if exists "public read approved special dates" on public.seller_special_dates;
drop policy if exists "seller manage own special dates" on public.seller_special_dates;
create policy "read approved or own special dates" on public.seller_special_dates for select to anon, authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_special_dates.seller_id and (
    s.verification_status='approved' or s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))
  ))
);
create policy "seller insert own special dates" on public.seller_special_dates for insert to authenticated with check (
  exists (select 1 from public.sellers s where s.id=seller_special_dates.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller update own special dates" on public.seller_special_dates for update to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_special_dates.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
) with check (
  exists (select 1 from public.sellers s where s.id=seller_special_dates.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller delete own special dates" on public.seller_special_dates for delete to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_special_dates.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);

drop policy if exists "public read approved seller website settings" on public.seller_website_settings;
drop policy if exists "seller manage own website settings" on public.seller_website_settings;
create policy "read approved or own seller website settings" on public.seller_website_settings for select to anon, authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_website_settings.seller_id and (
    s.verification_status='approved' or s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))
  ))
);
create policy "seller insert own website settings" on public.seller_website_settings for insert to authenticated with check (
  exists (select 1 from public.sellers s where s.id=seller_website_settings.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller update own website settings" on public.seller_website_settings for update to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_website_settings.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
) with check (
  exists (select 1 from public.sellers s where s.id=seller_website_settings.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
create policy "seller delete own website settings" on public.seller_website_settings for delete to authenticated using (
  exists (select 1 from public.sellers s where s.id=seller_website_settings.seller_id and (s.user_id=(select auth.uid()) or exists(select 1 from public.admins a where a.user_id=(select auth.uid()))))
);
