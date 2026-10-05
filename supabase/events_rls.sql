-- =========================================================================
-- EventKalam: public.events Row Level Security (RLS) Policies
-- Enforces that ONLY users with public.profiles.role = 'admin' can insert,
-- update, or delete events, while all visitors and users can view them.
-- =========================================================================

-- 1. Enable Row Level Security on public.events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Only admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Only admins can update events" ON public.events;
DROP POLICY IF EXISTS "Only admins can delete events" ON public.events;

-- 3. SELECT POLICY: Everyone (visitors & users) can view events
CREATE POLICY "Anyone can view events"
  ON public.events
  FOR SELECT
  USING (true);

-- 4. INSERT POLICY: Only authenticated admins can create events
CREATE POLICY "Only admins can insert events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );

-- 5. UPDATE POLICY: Only authenticated admins can modify events
CREATE POLICY "Only admins can update events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );

-- 6. DELETE POLICY: Only authenticated admins can delete events
CREATE POLICY "Only admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );
