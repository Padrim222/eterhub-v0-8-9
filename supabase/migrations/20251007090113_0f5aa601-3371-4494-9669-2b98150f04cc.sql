-- Fix users table RLS policies
-- Remove the incorrect deny-all policy that blocks all access
DROP POLICY IF EXISTS "Deny anonymous access to users" ON public.users;

-- The existing "Users can view own data" policy already restricts access properly
-- It only allows authenticated users to view their own data
-- No need for an additional deny policy

-- Add DELETE policy for analyses table so users can remove their own analysis data
CREATE POLICY "Users can delete own analyses"
ON public.analyses
FOR DELETE
TO authenticated
USING (user_id = auth.uid());