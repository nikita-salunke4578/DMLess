import { supabase } from "@/integrations/supabase/client";

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function createJob(title: string, description: string, questions: {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({ title, description, recruiter_id: user.id })
    .select()
    .single();

  if (jobError) throw jobError;

  const questionsWithJobId = questions.map((q) => ({
    ...q,
    job_id: job.id,
  }));

  const { error: qError } = await supabase
    .from("questions")
    .insert(questionsWithJobId);

  if (qError) throw qError;

  return job;
}

export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchJobWithQuestions(jobId: string) {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (jobError) throw jobError;

  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("*")
    .eq("job_id", jobId);
  if (qError) throw qError;

  return { job, questions };
}

export async function fetchCandidatesForJob(jobId: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAllCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("*, jobs(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
}

export async function submitCandidate(
  jobId: string,
  name: string,
  email: string,
  answers: Record<string, string>,
  questions: { id: string; correct_option: string }[]
) {
  let score = 0;
  let allCorrect = true;

  for (const q of questions) {
    if (answers[q.id] === q.correct_option) {
      score++;
    } else {
      allCorrect = false;
    }
  }

  const status = allCorrect ? "SHORTLISTED" : "KNOCKED_OUT";

  console.log("📝 Submitting candidate...", { jobId, name, email, status, score });

  const { data, error } = await supabase
    .from("candidates")
    .insert({
      job_id: jobId,
      name,
      email,
      status,
      score,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error submitting candidate:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    throw error;
  }

  console.log("✓ Candidate submitted successfully:", data);
  return { candidate: data, status, score };
}

export async function uploadResume(candidateId: string, file: File) {
  // Use timestamp to create unique filename while preserving extension
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'pdf';
  const fileName = `resume_${timestamp}.${fileExtension}`;
  const filePath = `${candidateId}/${fileName}`;

  console.log("Step 1: Uploading file to storage...", { candidateId, fileName, filePath });

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("❌ Upload error:", uploadError);
    throw new Error(`Failed to upload resume: ${uploadError.message}`);
  }

  console.log("✓ File uploaded successfully to storage");

  // Wait for database consistency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Store the path in the database - direct UPDATE query
  console.log("Step 2: Updating candidate record with resume_url:", filePath);

  const { error: updateError } = await supabase
    .from("candidates")
    .update({ resume_url: filePath })
    .eq("id", candidateId);

  if (updateError) {
    console.error("❌ Database update error:", updateError);
    throw new Error(`Failed to save resume path: ${updateError.message}`);
  }

  console.log("✓ Resume URL updated in database");

  return filePath;
}

export async function uploadResumeForCandidate(candidateId: string, file: File) {
  // Use timestamp to create unique filename while preserving extension
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'pdf';
  const fileName = `resume_${timestamp}.${fileExtension}`;
  const filePath = `${candidateId}/${fileName}`;

  console.log("Step 1: Uploading file to storage...", { candidateId, fileName, filePath });

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("❌ Upload error:", uploadError);
    throw new Error(`Failed to upload resume: ${uploadError.message}`);
  }

  console.log("✓ File uploaded successfully to storage");

  // Wait for database consistency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Store the path in the database - direct UPDATE query
  console.log("Step 2: Updating candidate record with resume_url:", filePath);

  const { error: updateError } = await supabase
    .from("candidates")
    .update({ resume_url: filePath })
    .eq("id", candidateId);

  if (updateError) {
    console.error("❌ Database update error:", updateError);
    throw new Error(`Failed to save resume path: ${updateError.message}`);
  }

  console.log("✓ Resume URL updated in database");

  return filePath;
}

export async function getResumeDownloadUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(filePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function getJobStats(jobId: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select("status")
    .eq("job_id", jobId);
  if (error) throw error;

  const total = data.length;
  const knockedOut = data.filter((c) => c.status === "KNOCKED_OUT").length;
  const shortlisted = data.filter((c) => c.status === "SHORTLISTED").length;

  return { total, knockedOut, shortlisted };
}
