-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  semester INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
CREATE POLICY "Everyone can view assignments" 
ON public.assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Faculty can upload assignments" 
ON public.assignments 
FOR INSERT 
WITH CHECK (is_faculty(auth.uid()));

CREATE POLICY "Faculty can update assignments" 
ON public.assignments 
FOR UPDATE 
USING (is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete assignments" 
ON public.assignments 
FOR DELETE 
USING (is_faculty(auth.uid()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert storage bucket for assignments
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;