-- =========================================================================
-- EventKalam: Supabase Storage Row Level Security (RLS) Policy
-- Enforces that ONLY users with public.profiles.role = 'admin' can upload
-- or modify files, while visitors and normal users can only view.
-- =========================================================================

-- 1. Create the storage bucket 'event-media' if it does not already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop any prior policies on 'event-media'
DROP POLICY IF EXISTS "Public & Users Can View Event Media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event media" ON storage.objects;
DROP POLICY IF EXISTS "Only Admins Can Upload Event Media" ON storage.objects;
DROP POLICY IF EXISTS "Only Admins Can Update Event Media" ON storage.objects;
DROP POLICY IF EXISTS "Only Admins Can Delete Event Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- 4. VIEW / READ POLICY:
-- Normal users and visitors CAN view event media and showcase photos/videos
CREATE POLICY "Public & Users Can View Event Media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-media');

-- 5. INSERT / UPLOAD POLICY:
-- ONLY authenticated users whose public.profiles.role = 'admin' can upload
CREATE POLICY "Only Admins Can Upload Event Media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );

-- 6. UPDATE POLICY:
-- ONLY authenticated users whose public.profiles.role = 'admin' can replace/update
CREATE POLICY "Only Admins Can Update Event Media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );

-- 7. DELETE POLICY:
-- ONLY authenticated users whose public.profiles.role = 'admin' can delete
CREATE POLICY "Only Admins Can Delete Event Media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
    )
  );
