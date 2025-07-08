
-- PHASE 1: CRITICAL RLS POLICY IMPLEMENTATION (Fixed)
-- Enable Row Level Security on all unprotected tables with existence checks

-- 1. Enable RLS on security_logs table (admin-only access)
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;
CREATE POLICY "Admins can view security logs" ON public.security_logs
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;
CREATE POLICY "System can insert security logs" ON public.security_logs
  FOR INSERT WITH CHECK (true);

-- 2. Enable RLS on user_passport_progress (users see their own, admins see all)
ALTER TABLE public.user_passport_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own passport progress" ON public.user_passport_progress;
CREATE POLICY "Users can view their own passport progress" ON public.user_passport_progress
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own passport progress" ON public.user_passport_progress;
CREATE POLICY "Users can insert their own passport progress" ON public.user_passport_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own passport progress" ON public.user_passport_progress;
CREATE POLICY "Users can update their own passport progress" ON public.user_passport_progress
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all passport progress" ON public.user_passport_progress;
CREATE POLICY "Admins can view all passport progress" ON public.user_passport_progress
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- 3. Enable RLS on user_rewards (users see their own, admins see all)
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
CREATE POLICY "Users can view their own rewards" ON public.user_rewards
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.user_rewards;
CREATE POLICY "Users can insert their own rewards" ON public.user_rewards
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own rewards" ON public.user_rewards;
CREATE POLICY "Users can update their own rewards" ON public.user_rewards
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all rewards" ON public.user_rewards;
CREATE POLICY "Admins can view all rewards" ON public.user_rewards
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- 4. Enable RLS on user_benefits (users see their own, admins see all)
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own benefits" ON public.user_benefits;
CREATE POLICY "Users can view their own benefits" ON public.user_benefits
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own benefits" ON public.user_benefits;
CREATE POLICY "Users can insert their own benefits" ON public.user_benefits
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own benefits" ON public.user_benefits;
CREATE POLICY "Users can update their own benefits" ON public.user_benefits
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all benefits" ON public.user_benefits;
CREATE POLICY "Admins can view all benefits" ON public.user_benefits
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- 5. Enable RLS on user_stamps (users see their own, admins see all)
ALTER TABLE public.user_stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own stamps" ON public.user_stamps;
CREATE POLICY "Users can view their own stamps" ON public.user_stamps
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own stamps" ON public.user_stamps;
CREATE POLICY "Users can insert their own stamps" ON public.user_stamps
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all stamps" ON public.user_stamps;
CREATE POLICY "Admins can view all stamps" ON public.user_stamps
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- 6. Enable RLS on user_route_checkins (users see their own, admins see all)
ALTER TABLE public.user_route_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own checkins" ON public.user_route_checkins;
CREATE POLICY "Users can view their own checkins" ON public.user_route_checkins
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own checkins" ON public.user_route_checkins;
CREATE POLICY "Users can insert their own checkins" ON public.user_route_checkins
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all checkins" ON public.user_route_checkins;
CREATE POLICY "Admins can view all checkins" ON public.user_route_checkins
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

-- 7. Enable RLS on tourist_routes (public read, admin write)
ALTER TABLE public.tourist_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active tourist routes" ON public.tourist_routes;
CREATE POLICY "Public can view active tourist routes" ON public.tourist_routes
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage tourist routes" ON public.tourist_routes;
CREATE POLICY "Admins can manage tourist routes" ON public.tourist_routes
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- 8. Enable RLS on route_checkpoints (public read, admin write)
ALTER TABLE public.route_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view route checkpoints" ON public.route_checkpoints;
CREATE POLICY "Public can view route checkpoints" ON public.route_checkpoints
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage route checkpoints" ON public.route_checkpoints;
CREATE POLICY "Admins can manage route checkpoints" ON public.route_checkpoints
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- Add additional security functions for enhanced validation
CREATE OR REPLACE FUNCTION public.validate_user_data_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Users can only access their own data, admins can access all
  RETURN (auth.uid() = target_user_id) OR public.is_admin_or_tech(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_data_access_attempt(
  p_table_name TEXT,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    success,
    metadata
  ) VALUES (
    auth.uid(),
    p_action || '_' || p_table_name,
    true,
    jsonb_build_object(
      'table_name', p_table_name,
      'target_user_id', p_target_user_id,
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
