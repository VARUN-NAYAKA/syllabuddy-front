-- Ensure profiles are created automatically on signup and enforce unique identifiers
-- 1) Create/replace trigger to insert into public.profiles when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) Ensure updated_at is maintained automatically on updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Enforce uniqueness of USN/Employee ID (single column used for both)
CREATE UNIQUE INDEX IF NOT EXISTS unique_profiles_usn_or_employee_id
  ON public.profiles (usn_or_employee_id);

-- 4) Backfill profiles for existing users missing a profile
INSERT INTO public.profiles (user_id, full_name, email, user_type, usn_or_employee_id)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  u.email,
  COALESCE((u.raw_user_meta_data ->> 'user_type')::user_type, 'student'),
  COALESCE(u.raw_user_meta_data ->> 'usn_or_employee_id', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;