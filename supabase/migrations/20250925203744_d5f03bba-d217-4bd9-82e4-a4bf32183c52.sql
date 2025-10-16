-- Create storage policies for assignments bucket
CREATE POLICY "Faculty can upload assignments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assignments' AND 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE user_type = 'faculty'
  )
);

CREATE POLICY "Everyone can view assignments" ON storage.objects
FOR SELECT USING (bucket_id = 'assignments');

CREATE POLICY "Faculty can update their assignments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'assignments' AND 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE user_type = 'faculty'
  )
);

CREATE POLICY "Faculty can delete their assignments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assignments' AND 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE user_type = 'faculty'
  )
);