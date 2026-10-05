-- ==============================================================================
-- EVENTKALAM — ROW LEVEL SECURITY (RLS) FIX FOR public.profiles
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Ensure RLS is enabled on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting or restrictive SELECT policies on public.profiles
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own user" ON public.profiles;

-- 3. Create the standard secure policy allowing authenticated users to SELECT their own profile row
-- This allows the frontend to query: SELECT role, full_name, phone_number FROM public.profiles WHERE id = auth.uid()
-- It strictly forbids exposing other users' profiles to regular users.
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. Ensure authenticated users can also UPDATE their own profile information
DROP POLICY IF EXISTS "Users can update own basic profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 5. Ensure new user signups can INSERT their profile row
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
