-- =========================================================
-- Authentication System Schema
-- Run this in Supabase SQL Editor
-- =========================================================

-- =========================================================
-- Profiles table
-- =========================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plantation_name TEXT,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  language TEXT NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'si', 'ta')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- Enable Row Level Security
-- =========================================================

ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Drop old policies if they exist
-- =========================================================

DROP POLICY IF EXISTS
"Users can view own profile"
ON public.profiles;

DROP POLICY IF EXISTS
"Users can update own profile"
ON public.profiles;

-- =========================================================
-- Profiles policies
-- =========================================================

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- =========================================================
-- Auto create profile on signup
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    plantation_name,
    location
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'plantation_name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'location',
      ''
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- Trigger for new users
-- =========================================================

DROP TRIGGER IF EXISTS
on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Auto update updated_at timestamp
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS
update_profiles_updated_at
ON public.profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();