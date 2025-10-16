-- Add unique constraints to USN and Employee ID
ALTER TABLE public.profiles ADD CONSTRAINT unique_usn_or_employee_id UNIQUE (usn_or_employee_id);

-- Add designation column for faculty
ALTER TABLE public.profiles ADD COLUMN designation text;

-- Create a check constraint for valid designations
ALTER TABLE public.profiles ADD CONSTRAINT valid_designation 
  CHECK (designation IS NULL OR designation IN ('Assistant Professor', 'Associate Professor', 'Professor'));