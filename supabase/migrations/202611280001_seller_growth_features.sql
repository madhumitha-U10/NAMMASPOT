-- Seller Growth Features: seller-specific permissions, content moderation and public catalogue sections.
create table if not exists public.seller_feature_access (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references public.sellers(id) on delete cascade,
 feature_key text not null check(feature_key in ('offers','polls','subcategories','advanced_catalogue')),
 status text not null default 'not_requested' check(status in ('not_requested','pending','approved','rejected','suspended')),
 enabled boolean not null default false,
 requested_at timestamptz, reviewed_at timestamptz, reviewed_by uuid references auth.users(id) on delete set null,
 review_note text not null default '', config jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(seller_id,feature_key)
);
create table if not exists public.seller_offers (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.sellers(id) on delete cascade,
 title text not null check(length(trim(title)) between 3 and 100), description text not null default '' check(length(description)<=500),
 starts_at timestamptz not null, ends_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended','expired')),
 admin_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
create table if not exists public.seller_polls (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.sellers(id) on delete cascade,
 question text not null check(length(trim(question)) between 5 and 240),
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 6),
 ends_at timestamptz not null, status text not null default 'pending' check(status in ('pending','approved','rejected','suspended','expired')),
 show_results boolean not null default true, admin_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.seller_poll_votes (
 id uuid primary key default gen_random_uuid(), poll_id uuid not null references public.seller_polls(id) on delete cascade,
 voter_key text not null check(length(voter_key) between 16 and 100), option_index integer not null check(option_index between 0 and 5),
 created_at timestamptz not null default now(), unique(poll_id,voter_key)
);
create table if not exists public.seller_catalogue_subcategories (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.sellers(id) on delete cascade,
 name text not null check(length(trim(name)) between 2 and 60), sort_order integer not null default 0,
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 created_at timestamptz not null default now(), unique(seller_id,name)
);
create index if not exists seller_feature_access_status_idx on public.seller_feature_access(status,feature_key);
create index if not exists seller_feature_access_reviewed_by_idx on public.seller_feature_access(reviewed_by);
create index if not exists seller_offers_public_idx on public.seller_offers(seller_id,status,starts_at,ends_at);
create index if not exists seller_polls_public_idx on public.seller_polls(seller_id,status,ends_at);
create index if not exists seller_subcategories_seller_idx on public.seller_catalogue_subcategories(seller_id,status,sort_order);
alter table public.seller_feature_access enable row level security;
alter table public.seller_offers enable row level security;
alter table public.seller_polls enable row level security;
alter table public.seller_poll_votes enable row level security;
alter table public.seller_catalogue_subcategories enable row level security;
create policy "Seller can read own feature access" on public.seller_feature_access for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())));
create policy "Admin can read feature access" on public.seller_feature_access for select to authenticated using(public.is_admin());
create policy "Seller reads own offers" on public.seller_offers for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())));
create policy "Admin manages offers" on public.seller_offers for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Seller reads own polls" on public.seller_polls for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())));
create policy "Admin manages polls" on public.seller_polls for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public reads poll votes aggregate only" on public.seller_poll_votes for select to authenticated using(public.is_admin());
create policy "Seller reads own subcategories" on public.seller_catalogue_subcategories for select to authenticated using(exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=(select auth.uid())));
create policy "Admin manages subcategories" on public.seller_catalogue_subcategories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create or replace function public.seller_request_feature(p_feature_key text) returns void language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_seller_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_feature_key not in ('offers','polls','subcategories','advanced_catalogue') then raise exception 'Invalid feature'; end if;
 select id into v_seller_id from public.sellers where user_id=auth.uid() and verification_status='approved' limit 1;
 if v_seller_id is null then raise exception 'Approved seller account required'; end if;
 insert into public.seller_feature_access(seller_id,feature_key,status,enabled,requested_at) values(v_seller_id,p_feature_key,'pending',false,now())
 on conflict(seller_id,feature_key) do update set status='pending',enabled=false,requested_at=now(),reviewed_at=null,reviewed_by=null,review_note='',updated_at=now()
 where public.seller_feature_access.status in ('not_requested','rejected','suspended');
 if not found then raise exception 'A request is already pending or this feature is already enabled'; end if;
end $$;
revoke all on function public.seller_request_feature(text) from public,anon;
grant execute on function public.seller_request_feature(text) to authenticated;
create or replace function public.admin_set_seller_feature_access(p_seller_id uuid,p_feature_key text,p_status text,p_enabled boolean,p_note text default '') returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_feature_key not in ('offers','polls','subcategories','advanced_catalogue') then raise exception 'Invalid feature'; end if;
 if p_status not in ('approved','rejected','suspended','pending') then raise exception 'Invalid status'; end if;
 if p_enabled and p_status<>'approved' then raise exception 'Only approved features can be enabled'; end if;
 insert into public.seller_feature_access(seller_id,feature_key,status,enabled,reviewed_at,reviewed_by,review_note)
 values(p_seller_id,p_feature_key,p_status,p_enabled,now(),auth.uid(),left(coalesce(p_note,''),500))
 on conflict(seller_id,feature_key) do update set status=excluded.status,enabled=excluded.enabled,reviewed_at=now(),reviewed_by=auth.uid(),review_note=excluded.review_note,updated_at=now();
end $$;
revoke all on function public.admin_set_seller_feature_access(uuid,text,text,boolean,text) from public,anon;
grant execute on function public.admin_set_seller_feature_access(uuid,text,text,boolean,text) to authenticated;
create or replace function public.admin_list_seller_feature_access()
returns table(access_id uuid,seller_id uuid,business_name text,owner_name text,slug text,feature_key text,status text,enabled boolean,requested_at timestamptz,reviewed_at timestamptz,review_note text)
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 return query select a.id,a.seller_id,s.business_name,s.owner_name,s.slug,a.feature_key,a.status,a.enabled,a.requested_at,a.reviewed_at,a.review_note
 from public.seller_feature_access a join public.sellers s on s.id=a.seller_id order by a.requested_at desc nulls last,a.updated_at desc;
end $$;
revoke all on function public.admin_list_seller_feature_access() from public,anon;
grant execute on function public.admin_list_seller_feature_access() to authenticated;
