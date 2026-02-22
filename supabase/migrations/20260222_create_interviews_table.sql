-- Create interviews table for interview scheduling
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('zoom', 'google_meet', 'teams', 'other')) DEFAULT 'zoom',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Recruiters can view interviews for their candidates
CREATE POLICY "Recruiters can view own interviews" ON public.interviews
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.candidates 
      JOIN public.jobs ON candidates.job_id = jobs.id 
      WHERE interviews.candidate_id = candidates.id 
      AND jobs.recruiter_id = auth.uid()
    )
  );

-- RLS Policy: Recruiters can create interviews for their candidates
CREATE POLICY "Recruiters can create interviews" ON public.interviews
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates 
      JOIN public.jobs ON candidates.job_id = jobs.id 
      WHERE candidate_id = candidates.id 
      AND jobs.recruiter_id = auth.uid()
    )
  );

-- RLS Policy: Recruiters can update their interviews
CREATE POLICY "Recruiters can update own interviews" ON public.interviews
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.candidates 
      JOIN public.jobs ON candidates.job_id = jobs.id 
      WHERE interviews.candidate_id = candidates.id 
      AND jobs.recruiter_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates 
      JOIN public.jobs ON candidates.job_id = jobs.id 
      WHERE interviews.candidate_id = candidates.id 
      AND jobs.recruiter_id = auth.uid()
    )
  );

-- RLS Policy: Recruiters can delete their interviews
CREATE POLICY "Recruiters can delete own interviews" ON public.interviews
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.candidates 
      JOIN public.jobs ON candidates.job_id = jobs.id 
      WHERE interviews.candidate_id = candidates.id 
      AND jobs.recruiter_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
