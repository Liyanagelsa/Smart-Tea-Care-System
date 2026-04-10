-- ═══════════════════════════════════════════════════════════
-- Tea Disease Detection System - Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plantation_name TEXT,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'si', 'ta')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Detection history table
CREATE TABLE IF NOT EXISTS public.detection_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  disease TEXT NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  severity_level TEXT NOT NULL,
  severity_score INTEGER NOT NULL,
  treatment JSONB,
  all_probabilities JSONB,
  notes TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Helper function to check admin status (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_history ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own detections" ON public.detection_history;
DROP POLICY IF EXISTS "Users can view own detections" ON public.detection_history;
DROP POLICY IF EXISTS "Admins can view all detections" ON public.detection_history;
DROP POLICY IF EXISTS "Admins can delete detections" ON public.detection_history;

-- 5. Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. Detection history policies
CREATE POLICY "Users can insert own detections"
  ON public.detection_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own detections"
  ON public.detection_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete detections"
  ON public.detection_history FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plantation_name, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'plantation_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. Stats view for admin dashboard
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') AS total_users,
  (SELECT COUNT(*) FROM public.detection_history) AS total_detections,
  (SELECT COUNT(*) FROM public.detection_history WHERE created_at >= NOW() - INTERVAL '7 days') AS detections_this_week,
  (SELECT disease FROM public.detection_history
   WHERE disease != 'Healthy'
   GROUP BY disease ORDER BY COUNT(*) DESC LIMIT 1) AS most_common_disease;

-- 9. Storage bucket policy (run after creating bucket)
-- In Supabase Dashboard: Storage → New Bucket → "leaf-images" → Public
-- Then run:
INSERT INTO storage.buckets (id, name, public) VALUES ('leaf-images', 'leaf-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can upload leaf images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'leaf-images');

CREATE POLICY "Anyone can view leaf images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leaf-images');

-- 10. Set first admin (run after creating your account)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
