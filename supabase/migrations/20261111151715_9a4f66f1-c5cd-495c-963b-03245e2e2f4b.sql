REVOKE EXECUTE ON FUNCTION public.unlock_rewards(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.unlock_rewards(uuid, uuid) TO authenticated;