# Resume Upload Issue - Root Cause & Solution

## Problem Identified
The resume upload was silently failing because of missing **Row-Level Security (RLS) UPDATE policy** on the candidates table. Recruiters couldn't update the `resume_url` field in the database.

## Root Cause
In the database schema, there were only policies for:
- ✓ SELECT (view candidates)
- ✓ INSERT (submit as candidate)
- ✓ DELETE (delete candidates)
- ✗ UPDATE (missing!) - This is why resume URLs weren't being saved

## Solution: Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
cd skill-screen-hub-main
supabase migration up
```

This will apply the new migration file: `supabase/migrations/20260222150000_add_recruiter_update_candidates.sql`

### Option 2: Manual SQL in Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run this query:

```sql
-- Add UPDATE policy for recruiters to update candidates (for resume uploads)
CREATE POLICY "Recruiters can update own candidates" ON public.candidates
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = candidates.job_id AND jobs.recruiter_id = auth.uid())
  );

-- Also add INSERT policy for authenticated users 
DROP POLICY IF EXISTS "Anyone can submit as candidate" ON public.candidates;
CREATE POLICY "Anyone can submit as candidate"
ON public.candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

## How to Verify It's Working

### In Browser Console
After clicking upload, open Developer Tools (F12) and check Console tab. You should see:
```
Step 1: Uploading file to storage...
✓ File uploaded successfully to storage
Step 2: Updating candidate record in database...
✓ Candidate record updated successfully
Resume uploaded successfully!
```

### In Dashboard
1. Go to Job Detail or Candidates page
2. Refresh the page (F5)
3. The "No resume" label should now show View/Download buttons

## What Will Change After Migration

### For Candidates Uploading During Application
- Resume upload will work properly
- RecordThe resume will be saved to the database automatically
- Dashboard will show the resume is available

### For Recruiters Uploading on Behalf
- Click "Upload" button next to candidate name
- Select PDF file
- The upload will succeed and immediately appear
- No need to manually refresh

## Enhanced Error Messages
If upload still fails after migration, the browser console will now show:
- Exact error message
- Error code
- Whether it's a permission or storage issue

## Testing After Migration

1. **Test Candidate Upload**: 
   - Apply for a job
   - Pass the quiz
   - Upload resume from the form
   - Check dashboard

2. **Test Recruiter Upload**:
   - Go to Candidates page
   - For candidate without resume, click Upload
   - Select file and confirm
   - Should appear immediately

3. **Check Browser Console**:
   - F12 → Console tab
   - Look for upload progress logs
   - Verify no error messages
