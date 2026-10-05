-- ==============================================================================
-- EVENTKALAM — PRODUCTION DATABASE & SECURITY SCHEMA (SUPABASE)
-- Associated Company: Robokalam Technologies (Hanumkonda, Telangana)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
-- NOTE: role is restricted to 'user' or 'admin' and strictly defaults to 'user'
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY, -- e.g. 'EK-2026-001'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  contact_email TEXT NOT NULL DEFAULT 'robokalam@gmail.com',
  category TEXT NOT NULL DEFAULT 'AI & Tech',
  capacity INTEGER NOT NULL DEFAULT 100,
  registered_count INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  highlights TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  ticket_code TEXT NOT NULL UNIQUE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Event Media (Showcase Photos & Videos)
CREATE TABLE IF NOT EXISTS public.event_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Contact Form Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Automated Email Notification Logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- DATABASE LEVEL AUTHORIZATION & AUTOMATION TRIGGERS
-- ==============================================================================

-- Trigger: Automatically create public.profiles record when a user registers in auth.users
-- Critical Security Rule: EVERY new account is assigned role = 'user' by default.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user', -- Strictly 'user', never trust client metadata for roles!
    NEW.raw_user_meta_data->>'phone',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Prevent regular users from modifying their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Authorization failure: Users cannot modify their own account role.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current authenticated session is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own basic profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Events Policies
-- Normal Users: Can only SELECT (view) events.
-- Admins: Can INSERT, UPDATE, DELETE.
CREATE POLICY "Public can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (public.is_admin());

-- 3. Registrations Policies
-- Normal Users: Can view their own registrations and create their own registrations.
-- Admins: Can view and manage all registrations.
CREATE POLICY "Users and admins can view registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create registrations" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can cancel own registration" ON public.registrations
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- 4. Event Media Policies
-- Normal Users: Can only SELECT (view) event showcase media.
-- Admins: Can INSERT, UPDATE, DELETE showcase media.
CREATE POLICY "Public can view showcase media" ON public.event_media
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert showcase media" ON public.event_media
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update showcase media" ON public.event_media
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete showcase media" ON public.event_media
  FOR DELETE USING (public.is_admin());

-- 5. Contact Messages Policies
CREATE POLICY "Anyone can submit contact inquiry" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKETS & STORAGE RLS POLICIES
-- ==============================================================================

-- Create event media bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view event media images
CREATE POLICY "Public can view event media assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

-- Storage Policy: ONLY administrators can upload media assets
CREATE POLICY "Only administrators can upload event media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-media'
  AND public.is_admin()
);

-- Storage Policy: ONLY administrators can modify or delete media assets
CREATE POLICY "Only administrators can update or delete event media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-media'
  AND public.is_admin()
);

CREATE POLICY "Only administrators can delete event media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-media'
  AND public.is_admin()
);

-- ==============================================================================
-- SECURE INITIAL ADMIN ASSIGNMENT
-- ==============================================================================
-- To grant administrator privileges to your trusted official account,
-- sign up normally via the EventKalam Registration page, then run this
-- single query in your Supabase SQL Editor:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'eventkalam.team@gmail.com'; -- Or your official admin email
