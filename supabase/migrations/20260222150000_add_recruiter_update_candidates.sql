-- Add UPDATE policy for recruiters to update candidates (for resume uploads)
CREATE POLICY "Recruiters can update own candidates" ON public.candidates
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );

-- Add UPDATE policy for anonymous users to update their own resume after submission
CREATE POLICY "Anyone can update their resume" ON public.candidates
  FOR UPDATE TO anon, authenticated
  WITH CHECK (true)
  USING (true);

-- Also add INSERT policy for authenticated users (for recruiter uploaded resumes - if needed)
DROP POLICY IF EXISTS "Anyone can submit as candidate" ON public.candidates;
CREATE POLICY "Anyone can submit as candidate"
ON public.candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

