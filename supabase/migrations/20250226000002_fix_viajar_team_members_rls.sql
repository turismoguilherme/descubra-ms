-- Migration: Fix RLS policies for viajar_team_members
-- Description: Update RLS policies to use user_roles instead of raw_user_meta_data
-- Date: 2025-02-26
-- Note: This migration is idempotent and safe to run even if policies were already created correctly

-- Only proceed if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'viajar_team_members'
  ) THEN
    -- Remove old policy if it exists
    DROP POLICY IF EXISTS "Admins can manage team members" ON viajar_team_members;
    
    -- Create correct policy using user_roles (system standard)
    CREATE POLICY "Admins can manage team members"
      ON viajar_team_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'tech', 'master_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'tech', 'master_admin')
        )
      );
    
    -- Add policy for admins to view all members (including inactive)
    DROP POLICY IF EXISTS "Admins can view all team members" ON viajar_team_members;
    CREATE POLICY "Admins can view all team members"
      ON viajar_team_members
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'tech', 'master_admin')
        )
      );
  END IF;
END $$;
