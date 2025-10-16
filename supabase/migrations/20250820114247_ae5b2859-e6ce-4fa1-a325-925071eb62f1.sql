-- Add subject field to profiles table for faculty
ALTER TABLE public.profiles 
ADD COLUMN subject TEXT;

-- Update RLS policies to allow faculty to update their subject
-- The existing policies should already handle this, but let's ensure they work properly