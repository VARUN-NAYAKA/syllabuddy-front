-- Create storage buckets for syllabus and notes
INSERT INTO storage.buckets (id, name, public) VALUES ('syllabus', 'syllabus', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', true);

-- Create syllabus table
CREATE TABLE public.syllabus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL DEFAULT 5,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table  
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL DEFAULT 5,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for syllabus
CREATE POLICY "Everyone can view syllabus" 
ON public.syllabus 
FOR SELECT 
USING (true);

CREATE POLICY "Faculty can upload syllabus" 
ON public.syllabus 
FOR INSERT 
WITH CHECK (is_faculty(auth.uid()));

CREATE POLICY "Faculty can update syllabus" 
ON public.syllabus 
FOR UPDATE 
USING (is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete syllabus" 
ON public.syllabus 
FOR DELETE 
USING (is_faculty(auth.uid()));

-- RLS policies for notes
CREATE POLICY "Everyone can view notes" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Faculty can upload notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (is_faculty(auth.uid()));

CREATE POLICY "Faculty can update notes" 
ON public.notes 
FOR UPDATE 
USING (is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete notes" 
ON public.notes 
FOR DELETE 
USING (is_faculty(auth.uid()));

-- Storage policies for syllabus bucket
CREATE POLICY "Public syllabus access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'syllabus');

CREATE POLICY "Faculty can upload syllabus files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'syllabus' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can update syllabus files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'syllabus' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete syllabus files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'syllabus' AND is_faculty(auth.uid()));

-- Storage policies for notes bucket
CREATE POLICY "Public notes access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'notes');

CREATE POLICY "Faculty can upload notes files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'notes' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can update notes files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'notes' AND is_faculty(auth.uid()));

CREATE POLICY "Faculty can delete notes files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'notes' AND is_faculty(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_syllabus_updated_at
BEFORE UPDATE ON public.syllabus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();