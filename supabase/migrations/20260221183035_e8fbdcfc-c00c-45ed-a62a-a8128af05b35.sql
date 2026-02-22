
-- Fix 1: Drop the security definer view and recreate as security invoker
DROP VIEW IF EXISTS public.public_questions;
CREATE OR REPLACE VIEW public.public_questions 
WITH (security_invoker = true) AS
  SELECT id, job_id, question_text, option_a, option_b, option_c, option_d
  FROM public.questions;

-- Fix 2: Add rate limiting via a function for candidate submissions
-- The "Anyone can submit" policy is intentionally permissive for public forms
-- but let's add email+job uniqueness constraint enforcement
