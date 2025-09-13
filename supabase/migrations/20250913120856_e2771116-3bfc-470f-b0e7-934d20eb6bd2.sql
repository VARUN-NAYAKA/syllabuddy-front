-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  marks INTEGER CHECK (marks >= 0 AND marks <= 10),
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT
);

-- Create activities table for tracking all activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'assignment_upload', 'assignment_submit', 'syllabus_upload', 'notes_upload'
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policies for assignment_submissions
CREATE POLICY "Students can view their own submissions" 
ON public.assignment_submissions 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own submissions" 
ON public.assignment_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Faculty can view submissions for their subject" 
ON public.assignment_submissions 
FOR SELECT 
USING (
  is_faculty(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE assignments.id = assignment_submissions.assignment_id 
    AND assignments.subject = (
      SELECT profiles.subject FROM public.profiles 
      WHERE profiles.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Faculty can update submissions for grading" 
ON public.assignment_submissions 
FOR UPDATE 
USING (
  is_faculty(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE assignments.id = assignment_submissions.assignment_id 
    AND assignments.subject = (
      SELECT profiles.subject FROM public.profiles 
      WHERE profiles.user_id = auth.uid()
    )
  )
);

-- Policies for activities
CREATE POLICY "Users can view their own activities" 
ON public.activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Faculty can view all activities for their subject" 
ON public.activities 
FOR SELECT 
USING (
  is_faculty(auth.uid()) AND 
  subject = (
    SELECT profiles.subject FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  )
);

-- Function to auto-delete expired assignments
CREATE OR REPLACE FUNCTION public.delete_expired_assignments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.assignments 
  WHERE due_date IS NOT NULL 
  AND due_date < now();
END;
$$;

-- Create updated_at trigger for assignment_submissions
CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();