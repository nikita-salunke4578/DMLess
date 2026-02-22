
-- Fix: Allow both anon and authenticated users to submit as candidate
DROP POLICY IF EXISTS "Anyone can submit as candidate" ON public.candidates;
CREATE POLICY "Anyone can submit as candidate"
ON public.candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Fix: Allow both anon and authenticated users to upload resumes
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');
