-- Allow faculty to view student profiles for counting/listing
CREATE OR REPLACE FUNCTION public.is_faculty(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = _user_id
      and p.user_type = 'faculty'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_faculty(uuid) TO authenticated;

-- Create a targeted policy allowing faculty to view student profiles only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Faculty can view student profiles'
  ) THEN
    CREATE POLICY "Faculty can view student profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
      public.is_faculty(auth.uid()) AND user_type = 'student'
    );
  END IF;
END $$;