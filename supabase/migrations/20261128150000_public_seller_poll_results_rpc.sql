create or replace function public.get_seller_poll_results(p_poll_id uuid)
returns table(option_index integer, vote_count bigint)
language sql
stable
security definer
set search_path = ''
as $function$
  select v.option_index, count(*)::bigint as vote_count
  from public.seller_poll_votes as v
  join public.seller_polls as p on p.id = v.poll_id
  where p.id = p_poll_id
    and p.status = 'approved'
    and p.ends_at > now()
    and p.show_results is true
    and private.seller_has_feature(p.seller_id, 'polls')
  group by v.option_index
  order by v.option_index;
$function$;

revoke all on function public.get_seller_poll_results(uuid) from public;
grant execute on function public.get_seller_poll_results(uuid) to anon, authenticated;
