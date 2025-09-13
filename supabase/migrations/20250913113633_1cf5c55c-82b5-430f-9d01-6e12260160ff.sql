-- Create storage policies for assignments bucket
CREATE POLICY "Everyone can view assignments files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assignments');

CREATE POLICY "Faculty can upload assignments files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assignments' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can update assignments files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'assignments' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete assignments files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assignments' AND is_faculty(auth.uid()));

-- Create storage policies for student submissions bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('student_submissions', 'student_submissions', true);

CREATE POLICY "Everyone can view student submissions files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student_submissions');

CREATE POLICY "Students can upload their submissions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student_submissions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Students can update their submissions" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student_submissions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Students can delete their submissions" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student_submissions' AND auth.uid() IS NOT NULL);

-- Create student submissions table
CREATE TABLE public.student_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  marks INTEGER CHECK (marks >= 0 AND marks <= 10),
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on student submissions
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for student submissions
CREATE POLICY "Students can view their own submissions" 
ON public.student_submissions 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Faculty can view all submissions for their subject" 
ON public.student_submissions 
FOR SELECT 
USING (is_faculty(auth.uid()) AND subject = (SELECT subject FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can create their own submissions" 
ON public.student_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions" 
ON public.student_submissions 
FOR UPDATE 
USING (auth.uid() = student_id AND marks IS NULL);

CREATE POLICY "Faculty can update submissions for grading" 
ON public.student_submissions 
FOR UPDATE 
USING (is_faculty(auth.uid()) AND subject = (SELECT subject FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can delete their own ungraded submissions" 
ON public.student_submissions 
FOR DELETE 
USING (auth.uid() = student_id AND marks IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_submissions_updated_at
BEFORE UPDATE ON public.student_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();