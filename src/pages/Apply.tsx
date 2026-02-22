import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { submitCandidate, uploadResume } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle2, XCircle, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

export default function Apply() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"info" | "quiz" | "result">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; score: number; candidateId: string } | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) return;
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const { data: jobData, error: jobErr } = await supabase.from("jobs").select("*").eq("id", jobId!).single();
      if (jobErr) throw jobErr;
      setJob(jobData);
      const { data: qData, error: qErr } = await supabase.from("questions").select("*").eq("job_id", jobId!);
      if (qErr) throw qErr;
      setQuestions(qData || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStep("quiz");
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({ title: "Please answer all questions", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitCandidate(jobId!, name.trim(), email.trim(), answers, questions);
      setResult({ status: res.status, score: res.score, candidateId: res.candidate.id });
      setStep("result");
    } catch (err: any) {
      if (err.message?.includes("duplicate") || err.code === "23505") {
        toast({ title: "You've already applied for this position", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally { setSubmitting(false); }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || !result) return;
    if (resumeFile.type !== "application/pdf") {
      toast({ title: "Only PDF files are accepted", variant: "destructive" });
      return;
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      toast({ title: "File must be under 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      console.log("Starting resume upload for candidate:", result.candidateId);
      const filePath = await uploadResume(result.candidateId, resumeFile);
      console.log("Resume uploaded successfully. File path:", filePath);
      setResumeUploaded(true);
      toast({
        title: "✓ Resume uploaded successfully!",
        description: `Your resume "${resumeFile.name}" has been saved to your application.`
      });
    } catch (err: any) {
      console.error("Resume upload error:", err);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">This job posting is no longer available.</p>
      </div>
    );
  }

  const optionKeys = ["a", "b", "c", "d"] as const;
  const optionLabels = ["A", "B", "C", "D"];
  const optionFields = ["option_a", "option_b", "option_c", "option_d"] as const;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] opacity-10 blur-3xl pointer-events-none" style={{ background: "var(--gradient-warm)" }} />

      <header className="border-b bg-card/60 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold font-display text-foreground">Dmless</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground mb-2">{job.title}</h1>
          <p className="text-muted-foreground text-sm">{job.description}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "info" && (
            <motion.form
              key="info"
              onSubmit={handleStartQuiz}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="glass-card space-y-4"
            >
              <h2 className="text-lg font-semibold font-display text-foreground">Your Information</h2>
              <p className="text-sm text-muted-foreground">You'll need to answer {questions.length} screening questions. All answers must be correct to proceed.</p>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required maxLength={255} />
              </div>
              <Button type="submit" className="w-full gradient-bg border-0 glow-primary">Start Screening</Button>
            </motion.form>
          )}

          {step === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.35 }}
                  className="glass-card space-y-3"
                >
                  <p className="font-medium text-foreground">
                    <span className="text-primary font-display mr-2">{idx + 1}.</span>
                    {q.question_text}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {optionKeys.map((opt, optIdx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${answers[q.id] === opt
                          ? "border-primary bg-primary/5 text-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/20"
                          }`}
                      >
                        <span className="font-medium text-muted-foreground mr-2">{optionLabels[optIdx]}.</span>
                        {q[optionFields[optIdx]]}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="w-full gradient-bg border-0 glow-primary"
                size="lg"
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </Button>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-card text-center space-y-4"
            >
              {result.status === "SHORTLISTED" ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
                  </motion.div>
                  <h2 className="text-xl font-bold font-display text-foreground">Congratulations!</h2>
                  <p className="text-muted-foreground">You scored {result.score}/{questions.length}. Please upload your resume to complete your application.</p>

                  {!resumeUploaded ? (
                    <div className="space-y-3 max-w-sm mx-auto">
                      <Label htmlFor="resume" className="block text-left">Upload Resume (PDF only, max 5MB)</Label>
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                      {resumeFile && (
                        <p className="text-xs text-muted-foreground text-center">
                          Selected: <span className="font-semibold text-foreground">{resumeFile.name}</span>
                        </p>
                      )}
                      <Button
                        onClick={handleResumeUpload}
                        disabled={!resumeFile || uploading}
                        className="w-full gradient-bg border-0"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Resume"}
                      </Button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg bg-success/10 text-success"
                    >
                      <CheckCircle2 className="h-5 w-5 inline mr-2" />
                      Resume uploaded! Your application is complete.
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  >
                    <XCircle className="h-16 w-16 text-destructive mx-auto" />
                  </motion.div>
                  <h2 className="text-xl font-bold font-display text-foreground">Not Qualified</h2>
                  <p className="text-muted-foreground">
                    You scored {result.score}/{questions.length}. Unfortunately, you did not pass the screening for this position.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
