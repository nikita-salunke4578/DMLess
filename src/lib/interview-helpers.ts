import { supabase } from "@/integrations/supabase/client";

export interface Interview {
  id: string;
  candidate_id: string;
  job_id?: string;
  scheduled_at: string;
  meeting_link?: string;
  meeting_type?: "zoom" | "google_meet" | "teams" | "other";
  notes?: string;
  created_at: string;
  candidate?: {
    name: string;
    email: string;
  };
}

export interface ScheduleInterviewData {
  candidateId: string;
  scheduledAt: string;
  meetingLink?: string;
  meetingType?: "zoom" | "google_meet" | "teams" | "other";
  notes?: string;
}

// Schedule an interview
export async function scheduleInterview(data: ScheduleInterviewData): Promise<Interview> {
  const { data: interview, error } = await (supabase as any)
    .from("interviews")
    .insert({
      candidate_id: data.candidateId,
      scheduled_at: data.scheduledAt,
      meeting_link: data.meetingLink,
      meeting_type: data.meetingType || "zoom",
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return interview as Interview;
}

// Fetch interviews for a candidate
export async function fetchCandidateInterviews(candidateId: string): Promise<Interview[]> {
  const { data, error } = await (supabase as any)
    .from("interviews")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data || []) as Interview[];
}

// Fetch all upcoming interviews for a recruiter
export async function fetchUpcomingInterviews(): Promise<Interview[]> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase as any)
    .from("interviews")
    .select("*, candidates(name, email)")
    .gt("scheduled_at", now)
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data || []) as Interview[];
}

// Update interview
export async function updateInterview(
  interviewId: string,
  updates: Partial<ScheduleInterviewData>
): Promise<Interview> {
  const updateData: any = {};
  if (updates.scheduledAt) updateData.scheduled_at = updates.scheduledAt;
  if (updates.meetingLink) updateData.meeting_link = updates.meetingLink;
  if (updates.meetingType) updateData.meeting_type = updates.meetingType;
  if (updates.notes) updateData.notes = updates.notes;

  const { data, error } = await (supabase as any)
    .from("interviews")
    .update(updateData)
    .eq("id", interviewId)
    .select()
    .single();

  if (error) throw error;
  return data as Interview;
}

// Cancel interview
export async function cancelInterview(interviewId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("interviews")
    .delete()
    .eq("id", interviewId);

  if (error) throw error;
}

// Generate calendar invite text
export function generateCalendarInvite(
  interview: Interview,
  candidateName: string,
  recruiterName: string
): string {
  const date = new Date(interview.scheduled_at);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const meetingType = interview.meeting_type
    ? interview.meeting_type.replace(/_/g, " ").toUpperCase()
    : "Video Call";

  let emailText = "Interview Scheduled with " + recruiterName + "\n\n";
  emailText += "Date: " + dateStr + "\n";
  emailText += "Time: " + timeStr + "\n";
  emailText += "Meeting Link: " + (interview.meeting_link || "To be provided") + "\n";
  emailText += "Meeting Type: " + meetingType + "\n\n";

  if (interview.notes) {
    emailText += "Notes: " + interview.notes + "\n\n";
  }

  emailText += "Please confirm your availability by replying to this email.";

  return emailText;
}

// Send interview confirmation email (placeholder - requires backend service)
export async function sendInterviewConfirmation(
  candidateEmail: string,
  candidateName: string,
  recruiterName: string,
  interview: Interview
): Promise<void> {
  // This would typically call a backend function
  // For now, we'll just log it
  const emailContent = generateCalendarInvite(interview, candidateName, recruiterName);
  console.log("Email to send to:", candidateEmail);
  console.log(emailContent);

  // In production, call: await supabase.functions.invoke('send-interview-email', { ... })
}
