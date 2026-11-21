-- Remove the retired service-provider appointment feature.
drop function if exists public.create_service_appointment(uuid, text, date, time, text, text, text);
drop function if exists public.get_public_service_calendar(uuid, date, date);
drop function if exists public.get_public_service_slots(uuid, date);
drop table if exists public.service_appointments;
alter table public.seller_website_settings drop column if exists appointment_duration_minutes;
