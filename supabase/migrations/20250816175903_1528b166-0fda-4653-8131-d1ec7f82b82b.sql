-- Fix critical security vulnerability in documents and document_chunks tables
-- These tables contain sensitive government tourism data and should not be publicly accessible

-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "p_docs_read" ON public.documents;
DROP POLICY IF EXISTS "p_chunks_read" ON public.document_chunks;

-- Create secure RLS policies for documents table
-- Policy 1: Admins can access all documents
CREATE POLICY "Admins can access all documents"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech')
  )
);

-- Policy 2: Regional managers can access documents from their state
CREATE POLICY "Regional managers can access state documents"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.flowtrip_states fs ON ur.state_id = fs.id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal')
    AND fs.code = documents.state_code
  )
);

-- Policy 3: Authenticated users can access public tourism documents only
-- (This maintains functionality for the tourism app while securing sensitive docs)
CREATE POLICY "Authenticated users can access public tourism documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND category IN ('tourism', 'public_info', 'events')
  AND source NOT LIKE '%internal%'
  AND source NOT LIKE '%confidential%'
);

-- Policy 4: System/service access for RAG operations
CREATE POLICY "System can access documents for RAG operations"
ON public.documents
FOR SELECT
USING (
  -- Allow access from service contexts (when no user is authenticated but it's a system operation)
  -- This is needed for the RAG system to function
  auth.uid() IS NULL AND current_setting('role', true) = 'service_role'
);

-- Create secure RLS policies for document_chunks table
-- Policy 1: Admins can access all document chunks
CREATE POLICY "Admins can access all document chunks"
ON public.document_chunks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech')
  )
);

-- Policy 2: Regional managers can access chunks from their state documents
CREATE POLICY "Regional managers can access state document chunks"
ON public.document_chunks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.flowtrip_states fs ON ur.state_id = fs.id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal')
    AND fs.code = document_chunks.state_code
  )
);

-- Policy 3: Authenticated users can access chunks from public documents only
CREATE POLICY "Authenticated users can access public document chunks"
ON public.document_chunks
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_chunks.document_id
    AND d.category IN ('tourism', 'public_info', 'events')
    AND d.source NOT LIKE '%internal%'
    AND d.source NOT LIKE '%confidential%'
  )
);

-- Policy 4: System/service access for RAG operations on document chunks
CREATE POLICY "System can access document chunks for RAG operations"
ON public.document_chunks
FOR SELECT
USING (
  -- Allow access from service contexts for RAG system
  auth.uid() IS NULL AND current_setting('role', true) = 'service_role'
);

-- Add audit logging triggers for document access
CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER document_chunks_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.document_chunks
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

-- Create function to log document access attempts for security monitoring
CREATE OR REPLACE FUNCTION public.log_document_access(
  p_document_id uuid,
  p_access_type text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    resource_type,
    resource_id,
    details
  ) VALUES (
    'document_access_' || p_access_type,
    p_user_id,
    true,
    'documents',
    p_document_id,
    jsonb_build_object(
      'document_id', p_document_id,
      'access_type', p_access_type,
      'timestamp', now()
    )
  );
END;
$$;

-- Create function to validate document access permissions
CREATE OR REPLACE FUNCTION public.can_access_document(
  p_document_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_state_code text;
  doc_category text;
  doc_source text;
  user_role text;
  user_state_id uuid;
  has_access boolean := false;
BEGIN
  -- Get document details
  SELECT state_code, category, source
  INTO doc_state_code, doc_category, doc_source
  FROM public.documents
  WHERE id = p_document_id;
  
  IF doc_state_code IS NULL THEN
    RETURN false;
  END IF;
  
  -- If no user (system access), allow based on service role
  IF p_user_id IS NULL THEN
    RETURN current_setting('role', true) = 'service_role';
  END IF;
  
  -- Get user role and state
  SELECT ur.role, ur.state_id
  INTO user_role, user_state_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
  
  -- Admin access
  IF user_role IN ('admin', 'tech') THEN
    has_access := true;
  -- Regional manager access
  ELSIF user_role IN ('diretor_estadual', 'gestor_igr', 'gestor_municipal') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.flowtrip_states fs
      WHERE fs.id = user_state_id
      AND fs.code = doc_state_code
    ) INTO has_access;
  -- Regular user access to public documents only
  ELSE
    has_access := (
      doc_category IN ('tourism', 'public_info', 'events')
      AND doc_source NOT LIKE '%internal%'
      AND doc_source NOT LIKE '%confidential%'
    );
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_document_access(p_document_id, 'permission_check', p_user_id);
  
  RETURN has_access;
END;
$$;