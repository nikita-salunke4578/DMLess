-- FIX: Add SELECT policy for anonymous users to see their own candidates
-- This allows candidates to view their submission status
CREATE POLICY "Anon users can view candidates" ON public.candidates
  FOR SELECT TO anon USING (true);

-- FIX: Ensure recruiters can see all candidates for their jobs (update the existing policy to be more explicit)
DROP POLICY IF EXISTS "Recruiters can view own candidates" ON public.candidates;
CREATE POLICY "Recruiters can view candidates for their jobs" ON public.candidates
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );
