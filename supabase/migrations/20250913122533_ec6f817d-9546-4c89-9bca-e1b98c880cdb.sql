-- Create storage policies for assignment submissions
CREATE POLICY "Students can upload their own submissions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student_submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their own submissions" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student_submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Faculty can view all submissions" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student_submissions' AND is_faculty(auth.uid()));

CREATE POLICY "Students can update their own submissions" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student_submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own submissions" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student_submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for assignment_submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_submissions;

-- Enable realtime for activities table  
ALTER PUBLICATION supabase_realtime ADD TABLE activities;