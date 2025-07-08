
ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;

COMMENT ON COLUMN public.user_profiles.full_name IS 'User''s full name, for display purposes in the application.';
