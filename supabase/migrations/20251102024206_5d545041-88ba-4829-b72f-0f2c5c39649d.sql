-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;