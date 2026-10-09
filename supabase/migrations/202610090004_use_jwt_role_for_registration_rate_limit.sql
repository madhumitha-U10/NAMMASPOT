create or replace function public.check_seller_registration_rate_limit(p_ip_hash text, p_phone_hash text, p_id_hash text)
returns boolean language plpgsql security definer set search_path = ''
as $function$
declare v_ip_count integer; v_phone_count integer; v_id_count integer;
begin
  if (auth.jwt() ->> 'role') <> 'service_role' then raise exception 'Service role required'; end if;
  if coalesce(length(p_ip_hash),0) < 32 or coalesce(length(p_phone_hash),0) < 32 or coalesce(length(p_id_hash),0) < 32 then raise exception 'Invalid registration rate-limit key'; end if;
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  select count(*)::integer into v_ip_count from private.seller_registration_rate_limits where ip_hash=p_ip_hash and created_at > now() - interval '1 hour';
  select count(*)::integer into v_phone_count from private.seller_registration_rate_limits where phone_hash=p_phone_hash and created_at > now() - interval '24 hours';
  select count(*)::integer into v_id_count from private.seller_registration_rate_limits where nammaspot_id_hash=p_id_hash and created_at > now() - interval '1 hour';
  if v_ip_count >= 10 or v_phone_count >= 3 or v_id_count >= 5 then return false; end if;
  insert into private.seller_registration_rate_limits(ip_hash,phone_hash,nammaspot_id_hash,created_at) values (p_ip_hash,p_phone_hash,p_id_hash,now());
  delete from private.seller_registration_rate_limits where created_at < now() - interval '7 days';
  return true;
end;
$function$;
