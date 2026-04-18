UPDATE public.platform_policies
SET is_published = true,
    updated_at = now()
WHERE key = 'partner_terms';