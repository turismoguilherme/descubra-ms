
DROP VIEW IF EXISTS public.commercial_partners_public;

CREATE VIEW public.commercial_partners_public
WITH (security_invoker = true) AS
SELECT
  id, company_name, trade_name, business_type, company_size,
  contact_email, website_url, description, address, city, state, zip_code,
  latitude, longitude, logo_url, cover_image_url, gallery_images,
  services_offered, target_audience, price_range, operating_hours, seasonal_info,
  subscription_plan, total_views, total_clicks, featured, verified, status,
  created_at, updated_at
FROM public.commercial_partners
WHERE status = 'approved' AND subscription_status = 'active';

GRANT SELECT ON public.commercial_partners_public TO anon, authenticated;
