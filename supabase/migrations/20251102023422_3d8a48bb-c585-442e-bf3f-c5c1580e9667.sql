-- Add cuisine profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN nutrition_balance TEXT,
ADD COLUMN cuisine_variety TEXT,
ADD COLUMN suggestions TEXT;