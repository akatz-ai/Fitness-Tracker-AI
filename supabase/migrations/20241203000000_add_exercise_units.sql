-- Add unit column to exercises table
-- Supports: lbs, kg, min, sec, miles, km, cal, bodyweight

-- Add unit column with default 'lbs'
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'lbs';

-- Make sets and reps nullable (for cardio exercises)
ALTER TABLE public.exercises
ALTER COLUMN sets DROP NOT NULL,
ALTER COLUMN reps DROP NOT NULL;

-- Add check constraint for valid units
ALTER TABLE public.exercises
ADD CONSTRAINT exercises_unit_check
CHECK (unit IN ('lbs', 'kg', 'min', 'sec', 'miles', 'km', 'cal', 'bodyweight'));

-- Update existing rows to have 'lbs' as unit if null
UPDATE public.exercises SET unit = 'lbs' WHERE unit IS NULL;
