
create or replace function public.create_public_enquiry(
  p_seller_id uuid,
  p_product_id uuid,
  p_customer_name text,
  p_customer_contact text,
  p_message text
)
returns table(id uuid, status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  clean_name text := btrim(coalesce(p_customer_name, ''));
  clean_contact text := btrim(coalesce(p_customer_contact, ''));
  clean_message text := btrim(coalesce(p_message, ''));
  current_user_id uuid := auth.uid();
begin
  if p_seller_id is null then
    raise exception 'Choose a seller before sending an enquiry';
  end if;
  if length(clean_name) < 2 or length(clean_name) > 120 then
    raise exception 'Enter your name (2 to 120 characters)';
  end if;
  if length(clean_contact) < 5 or length(clean_contact) > 160 then
    raise exception 'Enter a valid contact number';
  end if;
  if length(clean_message) < 1 or length(clean_message) > 2000 then
    raise exception 'Your message must be between 1 and 2000 characters';
  end if;

  if not exists (
    select 1 from public.sellers s
    where s.id = p_seller_id and s.verification_status = 'approved'
  ) then
    raise exception 'This seller is not currently accepting enquiries';
  end if;

  if p_product_id is not null and not exists (
    select 1 from public.products p
    where p.id = p_product_id
      and p.seller_id = p_seller_id
      and p.available is not false
  ) then
    raise exception 'This product is unavailable';
  end if;

  return query
    insert into public.enquiries (
      user_id, seller_id, product_id, customer_name, customer_contact, message, status
    )
    values (
      current_user_id, p_seller_id, p_product_id, clean_name, clean_contact, clean_message, 'pending'
    )
    returning enquiries.id, enquiries.status;
end;
$$;

revoke all on function public.create_public_enquiry(uuid, uuid, text, text, text) from public;
grant execute on function public.create_public_enquiry(uuid, uuid, text, text, text) to anon, authenticated;
