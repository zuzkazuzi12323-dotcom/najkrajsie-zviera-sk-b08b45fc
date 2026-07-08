REVOKE EXECUTE ON FUNCTION public.rotate_featured_shelter() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_featured_shelter() TO service_role;
CREATE EXTENSION IF NOT EXISTS pg_cron;