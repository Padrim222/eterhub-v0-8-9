-- Fix RLS policies to prevent public access to sensitive user data
-- Drop existing policies that incorrectly allow public access
DROP POLICY IF EXISTS "Users can view own posts" ON public.ig_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.ig_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.ig_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.ig_posts;

-- Recreate ig_posts policies with authenticated role only
CREATE POLICY "Users can view own posts"
ON public.ig_posts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own posts"
ON public.ig_posts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
ON public.ig_posts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
ON public.ig_posts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Verify users table SELECT policy is restricted to authenticated users (already correct)
-- The existing "Users can view own data" policy on users table already uses TO authenticated