-- This RPC function will update resume_url bypassing RLS checks
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_resume_url(uuid, text);

-- Create security definer function to handle resume updates
CREATE OR REPLACE FUNCTION public.update_resume_url(
  candidate_id uuid,
  resume_path text
)
RETURNS TABLE (
  id uuid,
  resume_url text
) AS $$
BEGIN
  -- Update the candidate record
  UPDATE public.candidates
  SET resume_url = resume_path
  WHERE id = candidate_id;

  -- Return the updated record
  RETURN QUERY
  SELECT
    c.id,
    c.resume_url
  FROM public.candidates c
  WHERE c.id = candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Give everyone permission to call this function
GRANT EXECUTE ON FUNCTION public.update_resume_url(uuid, text) TO anon, authenticated, service_role;
