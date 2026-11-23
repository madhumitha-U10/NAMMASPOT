-- The public enquiry RPC can write through the existing anon/authenticated INSERT grant and seller-scoped RLS policy.
-- Keep it SECURITY INVOKER so the table's row-level checks are enforced for the caller.
alter function public.create_public_enquiry(uuid, uuid, text, text, text) security invoker;
