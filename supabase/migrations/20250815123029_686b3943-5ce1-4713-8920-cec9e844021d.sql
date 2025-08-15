-- Enable Row Level Security on flowtrip_states table
-- This table contains sensitive business data like billing emails, contract dates, and monthly fees
ALTER TABLE public.flowtrip_states ENABLE ROW LEVEL SECURITY;

-- The existing policies are already in place and appropriate:
-- 1. FlowTrip admins can manage all states (admin, tech roles)
-- 2. State users can view their own state data only
-- 
-- This migration simply enables RLS enforcement which was missing