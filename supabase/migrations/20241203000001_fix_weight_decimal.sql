-- Fix weight column to support decimal values (e.g., 2.5 miles)
-- Change from integer to numeric for precision

ALTER TABLE public.exercises
ALTER COLUMN weight TYPE numeric(10,2) USING weight::numeric(10,2);
