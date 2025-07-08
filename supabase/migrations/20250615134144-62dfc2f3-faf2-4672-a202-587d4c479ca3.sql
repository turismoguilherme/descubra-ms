
-- This helper function checks if a user has a manager-level role.
-- We'll use this in our policies to grant write access.
CREATE OR REPLACE FUNCTION public.is_manager(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role IN ('admin', 'tech', 'gestor', 'municipal')
  );
$$;

-- Secure the 'destinations' table
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view destinations" ON public.destinations;
CREATE POLICY "Public can view destinations" ON public.destinations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Managers can manage destinations" ON public.destinations;
CREATE POLICY "Managers can manage destinations" ON public.destinations FOR ALL USING (public.is_manager(auth.uid()));

-- Secure the 'events' table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Managers can manage events" ON public.events;
CREATE POLICY "Managers can manage events" ON public.events FOR ALL USING (public.is_manager(auth.uid()));

-- Secure the 'institutional_partners' table
ALTER TABLE public.institutional_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;
CREATE POLICY "Public can view approved partners" ON public.institutional_partners FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Authenticated users can submit partner requests" ON public.institutional_partners;
CREATE POLICY "Authenticated users can submit partner requests" ON public.institutional_partners FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Managers can manage partners" ON public.institutional_partners;
CREATE POLICY "Managers can manage partners" ON public.institutional_partners FOR ALL TO authenticated USING (public.is_manager(auth.uid()));

-- Secure the 'pantanal_animals' table
ALTER TABLE public.pantanal_animals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view pantanal animals" ON public.pantanal_animals;
CREATE POLICY "Public can view pantanal animals" ON public.pantanal_animals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Managers can manage pantanal animals" ON public.pantanal_animals;
CREATE POLICY "Managers can manage pantanal animals" ON public.pantanal_animals FOR ALL USING (public.is_manager(auth.uid()));

-- Secure the 'cerrado_animals' table
ALTER TABLE public.cerrado_animals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view cerrado animals" ON public.cerrado_animals;
CREATE POLICY "Public can view cerrado animals" ON public.cerrado_animals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Managers can manage cerrado animals" ON public.cerrado_animals;
CREATE POLICY "Managers can manage cerrado animals" ON public.cerrado_animals FOR ALL USING (public.is_manager(auth.uid()));

-- Secure the 'tourism_intelligence_documents' table
ALTER TABLE public.tourism_intelligence_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managers can manage tourism intelligence documents" ON public.tourism_intelligence_documents;
CREATE POLICY "Managers can manage tourism intelligence documents" ON public.tourism_intelligence_documents FOR ALL USING (public.is_manager(auth.uid()));
