-- ============================================
-- COMPLETE DATABASE SETUP - RUN THIS FIRST
-- ============================================
-- This combines all migrations in the correct order

-- ============================================
-- MIGRATION 1: Create Tables & Initial RLS
-- ============================================

-- Create status enum
CREATE TYPE public.candidate_status AS ENUM ('KNOCKED_OUT', 'SHORTLISTED');

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Questions table (5 MCQs per job)
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd'))
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status public.candidate_status NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, email)
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Jobs RLS: recruiters manage their own jobs
CREATE POLICY "Recruiters can view own jobs" ON public.jobs
  FOR SELECT TO authenticated USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can create jobs" ON public.jobs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own jobs" ON public.jobs
  FOR DELETE TO authenticated USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own jobs" ON public.jobs
  FOR UPDATE TO authenticated USING (auth.uid() = recruiter_id);

-- Public read for jobs (candidates need to see job info via public link)
CREATE POLICY "Anyone can view jobs" ON public.jobs
  FOR SELECT TO anon USING (true);

-- Questions RLS
CREATE POLICY "Recruiters can manage own questions" ON public.questions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = questions.job_id AND jobs.recruiter_id = auth.uid())
  );

-- Public read for questions (candidates need to see questions)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT TO anon USING (true);

-- Candidates RLS: recruiters see candidates for their jobs
CREATE POLICY "Recruiters can view own candidates" ON public.candidates
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );

-- Anon can insert candidates (public submission)
CREATE POLICY "Anyone can submit as candidate" ON public.candidates
  FOR INSERT TO anon WITH CHECK (true);

-- Recruiters can delete candidates
CREATE POLICY "Recruiters can delete candidates" ON public.candidates
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes
CREATE POLICY "Anyone can upload resumes" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Recruiters can view resumes" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'resumes');

-- Create a view that hides correct answers for public use
CREATE OR REPLACE VIEW public.public_questions AS
  SELECT id, job_id, question_text, option_a, option_b, option_c, option_d
  FROM public.questions;

-- ============================================
-- MIGRATION 2: Fix View Security
-- ============================================

DROP VIEW IF EXISTS public.public_questions;
CREATE OR REPLACE VIEW public.public_questions 
WITH (security_invoker = true) AS
  SELECT id, job_id, question_text, option_a, option_b, option_c, option_d
  FROM public.questions;

-- ============================================
-- MIGRATION 3: Fix Policies for Auth Users
-- ============================================

DROP POLICY IF EXISTS "Anyone can submit as candidate" ON public.candidates;
CREATE POLICY "Anyone can submit as candidate"
ON public.candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');

-- ============================================
-- MIGRATION 4: Add UPDATE Policy for Resumes
-- ============================================

CREATE POLICY "Recruiters can update own candidates" ON public.candidates
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );

CREATE POLICY "Anyone can update their resume" ON public.candidates
  FOR UPDATE TO anon, authenticated
  WITH CHECK (true)
  USING (true);

-- ============================================
-- Setup Complete! Tables are ready to use.
-- ============================================
