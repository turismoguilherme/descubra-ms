
-- Create location logs table for tracking user locations
CREATE TABLE IF NOT EXISTS public.location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  context TEXT, -- 'checkin', 'general', etc.
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for location logs
CREATE POLICY "Users can view own location logs" ON public.location_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location logs" ON public.location_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_location_logs_user_id ON public.location_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_location_logs_created_at ON public.location_logs(created_at);
