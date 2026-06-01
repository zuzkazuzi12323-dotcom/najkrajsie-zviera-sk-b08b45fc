REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_dog() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_payment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_vote_on_archived_dog() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_vote_rate_limit() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_blocked() FROM authenticated;