-- Create assignment_files table to support multiple files per assignment
CREATE TABLE public.assignment_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;

-- Everyone can view assignment files
CREATE POLICY "Everyone can view assignment files"
ON public.assignment_files
FOR SELECT
USING (true);

-- Faculty can upload assignment files
CREATE POLICY "Faculty can upload assignment files"
ON public.assignment_files
FOR INSERT
WITH CHECK (is_faculty(auth.uid()));

-- Faculty can delete assignment files
CREATE POLICY "Faculty can delete assignment files"
ON public.assignment_files
FOR DELETE
USING (is_faculty(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_assignment_files_assignment_id ON public.assignment_files(assignment_id);

-- Add real-time support
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_files;