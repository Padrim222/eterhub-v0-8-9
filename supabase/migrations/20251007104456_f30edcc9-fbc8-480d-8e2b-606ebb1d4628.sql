-- Fix public exposure of users and analyses tables
-- These tables contain sensitive PII that should never be publicly accessible

-- First, ensure the users table policies properly restrict access to authenticated users only
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Recreate users policies with TO authenticated to block anonymous access
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Fix analyses table policies to prevent public access to business intelligence data
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;

-- Recreate analyses policies with TO authenticated
CREATE POLICY "Users can view own analyses"
ON public.analyses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analyses"
ON public.analyses
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own analyses"
ON public.analyses
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add missing UPDATE policy for analyses table
CREATE POLICY "Users can update own analyses"
ON public.analyses
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());