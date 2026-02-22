# Simple Resume Upload Fix

## Current Status
- ❌ Resumes bucket is empty → files not uploading
- ❌ Dashboard not showing candidates → either no data in DB or RLS blocking

## Step-by-Step Fix

### 1. First, Check Your Data (Supabase SQL Editor)

Run this to see if you have any candidates:
```sql
SELECT id, name, email, resume_url, status FROM public.candidates LIMIT 10;
```

### 2. Fix RLS Policies - Run in Supabase SQL Editor

**Delete all old policies and start fresh:**

```sql
-- Drop all old policies
DROP POLICY IF EXISTS "Recruiters can view candidates for their jobs" ON public.candidates;
DROP POLICY IF EXISTS "Recruiters can view own candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anyone can submit as candidate" ON public.candidates;
DROP POLICY IF EXISTS "Recruiters can delete candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anyone can update their resume" ON public.candidates;
DROP POLICY IF EXISTS "Anon users can view candidates" ON public.candidates;

-- CREATE SIMPLE POLICIES - Allow everything for now to debug
CREATE POLICY "Enable read for all" ON public.candidates
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all" ON public.candidates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all" ON public.candidates
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated" ON public.candidates
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );
```

### 3. Fix Storage Policies - Run in Supabase SQL Editor

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Recruiters can view resumes" ON storage.objects;

-- Create simple policies
CREATE POLICY "Enable insert for users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Enable read for users" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Enable update for users" ON storage.objects
  FOR UPDATE TO authenticated, anon USING (bucket_id = 'resumes') WITH CHECK (bucket_id = 'resumes');
```

### 4. Test Upload
1. Go to `/apply/[jobId]` 
2. Answer quiz
3. Upload resume
4. Check browser console for errors
5. Check Supabase Storage - files should appear
6. Check candidates table - resume_url should have a value

## If Still Not Working
Open browser DevTools (F12) → Console tab → screenshot the errors and share with me
