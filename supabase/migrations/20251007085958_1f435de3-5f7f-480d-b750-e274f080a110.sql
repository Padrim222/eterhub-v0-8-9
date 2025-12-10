-- Drop the existing restrictive SELECT policy on users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Create a new permissive policy that explicitly allows only authenticated users to view their own data
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Ensure no anonymous access by creating a deny-all policy for anonymous users
CREATE POLICY "Deny anonymous access to users"
ON public.users
FOR SELECT
TO anon
USING (false);