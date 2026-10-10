-- PostgreSQL grants function EXECUTE to PUBLIC by default; remove that default exposure.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
