create or replace function public.register_email_otp_request(p_email text)
returns jsonb language plpgsql security definer set search_path = 'private', 'pg_catalog'
as $function$
declare v_hash text; v_window_start timestamptz; v_global_count integer; v_email_hour integer; v_email_day integer; v_warning boolean := false;
begin
  if p_email is null or position('@' in trim(p_email))=0 then raise exception 'Invalid email address'; end if;
  v_hash := md5(lower(trim(p_email)));
  perform pg_advisory_xact_lock(hashtext('nammaspot_email_otp_global_hour'));
  perform pg_advisory_xact_lock(hashtext(v_hash));
  v_window_start := date_trunc('hour',now());
  select count(*)::integer into v_global_count from private.otp_request_log l where l.created_at >= v_window_start and l.created_at < v_window_start + interval '1 hour';
  select count(*)::integer into v_email_hour from private.otp_request_log l where l.phone_hash=v_hash and l.created_at >= now()-interval '1 hour';
  select count(*)::integer into v_email_day from private.otp_request_log l where l.phone_hash=v_hash and l.created_at >= now()-interval '24 hours';
  if v_email_hour >= 3 or v_email_day >= 6 or v_global_count >= 20 then
    if v_global_count >= 20 then
      insert into private.otp_usage_alerts(window_start,sms_count,threshold,alert_type) values(v_window_start,v_global_count,20,'email_blocked')
      on conflict(window_start,threshold) do update set sms_count=excluded.sms_count,alert_type='email_blocked';
    end if;
    return jsonb_build_object('allowed',false,'warning',v_global_count>=15,'email_count',v_global_count,'threshold',20,'window_start',v_window_start);
  end if;
  insert into private.otp_request_log(phone_hash,created_at) values(v_hash,now());
  v_global_count := v_global_count + 1;
  v_warning := v_global_count >= 15;
  if v_warning then
    insert into private.otp_usage_alerts(window_start,sms_count,threshold,alert_type) values(v_window_start,v_global_count,20,'email_warning')
    on conflict(window_start,threshold) do update set sms_count=excluded.sms_count,alert_type='email_warning';
  end if;
  return jsonb_build_object('allowed',true,'email_count',v_global_count,'warning',v_warning,'threshold',20,'window_start',v_window_start);
end;
$function$;

drop function if exists public.lookup_seller_email(text,text);
create function public.lookup_seller_email(p_nammaspot_id text,p_email text)
returns table(can_set_password boolean)
language plpgsql security definer set search_path = ''
as $function$
declare v_guard jsonb;
begin
  if p_nammaspot_id is null or length(trim(p_nammaspot_id)) < 3
     or p_email is null or position('@' in trim(p_email)) < 2 then
    raise exception 'Invalid account recovery details';
  end if;
  v_guard := public.register_email_otp_request(p_email);
  if coalesce((v_guard->>'allowed')::boolean,false) is false then
    raise exception 'Too many password setup requests. Please wait and try again later';
  end if;
  return query select (s.verification_status in ('pending','approved')) as can_set_password
    from public.sellers s
    where upper(trim(s.nammaspot_id))=upper(trim(p_nammaspot_id))
      and lower(trim(s.email))=lower(trim(p_email))
    limit 1;
end;
$function$;
revoke all on function public.register_email_otp_request(text) from public, anon, authenticated;
grant execute on function public.register_email_otp_request(text) to service_role;
revoke all on function public.lookup_seller_email(text,text) from public, authenticated;
grant execute on function public.lookup_seller_email(text,text) to anon, service_role;
