import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

const emptyQuestion = (): QuestionForm => ({
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a",
});

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>(Array.from({ length: 5 }, emptyQuestion));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({ title: "Please fill in job title and description", variant: "destructive" });
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        toast({ title: `Please complete all fields for Question ${i + 1}`, variant: "destructive" });
        return;
      }
    }
    setLoading(true);
    try {
      await createJob(title.trim(), description.trim(), questions);
      toast({ title: "Job created successfully!" });
      navigate("/dashboard/jobs");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const optionLabels = ["A", "B", "C", "D"];
  const optionKeys: (keyof QuestionForm)[] = ["option_a", "option_b", "option_c", "option_d"];

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="page-header">
          <Link to="/dashboard/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <h1 className="page-title font-display">Create New Job</h1>
          <p className="page-subtitle">Set up a position with 5 screening questions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="stat-card space-y-4"
          >
            <h2 className="text-lg font-semibold font-display text-foreground">Job Details</h2>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Developer" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, requirements, and responsibilities..." rows={4} required maxLength={5000} />
            </div>
          </motion.div>

          {questions.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + 1) * 0.06, duration: 0.35 }}
              className="stat-card space-y-4"
            >
              <h2 className="text-lg font-semibold font-display text-foreground">
                <span className="text-primary mr-1">Q{idx + 1}</span> Screening Question
              </h2>
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input value={q.question_text} onChange={(e) => updateQuestion(idx, "question_text", e.target.value)} placeholder="Enter your screening question..." required maxLength={500} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {optionKeys.map((key, optIdx) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">Option {optionLabels[optIdx]}</Label>
                    <Input value={q[key]} onChange={(e) => updateQuestion(idx, key, e.target.value)} placeholder={`Option ${optionLabels[optIdx]}`} required maxLength={300} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <div className="flex gap-2">
                  {["a", "b", "c", "d"].map((opt, optIdx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateQuestion(idx, "correct_option", opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        q.correct_option === opt
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {optionLabels[optIdx]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 glow-primary" size="lg">
            {loading ? "Creating..." : "Create Job & Generate Hiring Link"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
