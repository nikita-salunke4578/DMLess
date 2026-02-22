import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchJobWithQuestions, fetchCandidatesForJob, getResumeDownloadUrl, uploadResumeForCandidate } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Download, Users, UserCheck, UserX, Eye, Upload, X } from "lucide-react";
import { motion } from "framer-motion";

type FilterStatus = "ALL" | "SHORTLISTED" | "KNOCKED_OUT";

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [uploadingCandidateId, setUploadingCandidateId] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { if (jobId) loadData(); }, [jobId]);

  const loadData = async () => {
    try {
      const { job } = await fetchJobWithQuestions(jobId!);
      setJob(job);
      const cands = await fetchCandidatesForJob(jobId!);
      setCandidates(cands);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
    toast({ title: "Hiring link copied!" });
  };

  const filterCandidates = () => {
    if (filterStatus === "ALL") return candidates;
    return candidates.filter((c) => c.status === filterStatus);
  };

  const downloadResume = async (resumeUrl: string, candidateName: string) => {
    try {
      const url = await getResumeDownloadUrl(resumeUrl);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${candidateName}-resume.pdf`;
      a.click();
    } catch (err: any) {
      toast({ title: "Error downloading", description: err.message, variant: "destructive" });
    }
  };

  const viewResumeInNewTab = async (resumeUrl: string) => {
    try {
      const url = await getResumeDownloadUrl(resumeUrl);
      window.open(url, "_blank");
    } catch (err: any) {
      toast({ title: "Error opening resume", description: err.message, variant: "destructive" });
    }
  };

  const handleResumeUpload = async (candidateId: string) => {
    if (!resumeFile) return;
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
      await uploadResumeForCandidate(candidateId, resumeFile);
      toast({ title: "Resume uploaded successfully!" });
      setUploadingCandidateId(null);
      setResumeFile(null);
      // Reload candidates
      const cands = await fetchCandidatesForJob(jobId!);
      setCandidates(cands);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const exportCSV = () => {
    const shortlisted = candidates.filter((c) => c.status === "SHORTLISTED");
    if (shortlisted.length === 0) { toast({ title: "No shortlisted candidates to export" }); return; }
    const csv = ["Name,Email,Score,Date"]
      .concat(shortlisted.map((c) => `"${c.name}","${c.email}",${c.score},"${new Date(c.created_at).toLocaleDateString()}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job?.title || "candidates"}-shortlisted.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return <DashboardLayout><p className="text-muted-foreground">Job not found</p></DashboardLayout>;
  }

  const total = candidates.length;
  const knockedOut = candidates.filter((c) => c.status === "KNOCKED_OUT").length;
  const shortlisted = candidates.filter((c) => c.status === "SHORTLISTED").length;

  const statCards = [
    { label: "Total Applicants", value: total, icon: Users, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { label: "Knocked Out", value: knockedOut, icon: UserX, colorClass: "text-destructive", bgClass: "bg-destructive/10" },
    { label: "Shortlisted", value: shortlisted, icon: UserCheck, colorClass: "text-success", bgClass: "bg-success/10" },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="page-header">
          <Link to="/dashboard/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title font-display">{job.title}</h1>
              <p className="page-subtitle">{job.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`h-9 w-9 rounded-lg ${s.bgClass} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.colorClass}`} />
                </div>
              </div>
              <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="stat-card"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">Candidates & Resumes</h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b pb-4 flex-wrap">
            {[
              { label: "Total", value: "ALL" as FilterStatus, count: total },
              { label: "Shortlisted", value: "SHORTLISTED" as FilterStatus, count: shortlisted, icon: UserCheck, color: "text-green-600" },
              { label: "Knocked Out", value: "KNOCKED_OUT" as FilterStatus, count: knockedOut, icon: UserX, color: "text-red-600" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filterStatus === filter.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {filter.icon && <filter.icon className={`h-4 w-4 ${filter.color}`} />}
                <span>{filter.label}</span>
                <span className="text-xs font-semibold opacity-75">({filter.count})</span>
              </motion.button>
            ))}
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No candidates yet. Share the hiring link to start receiving applications.</p>
          ) : filterCandidates().length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No candidates with status "{filterStatus}"</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {filterCandidates().map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                      <td className="py-3 px-4 text-foreground">{c.score}/5</td>
                      <td className="py-3 px-4">
                        <span className={c.status === "SHORTLISTED" ? "candidate-badge-shortlisted" : "candidate-badge-knocked-out"}>
                          {c.status === "SHORTLISTED" ? "✓ Shortlisted" : "✗ Knocked Out"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {c.resume_url ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewResumeInNewTab(c.resume_url)}
                              className="text-primary hover:underline text-xs font-medium flex items-center gap-1"
                              title="View resume"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => downloadResume(c.resume_url, c.name)}
                              className="text-primary hover:underline text-xs font-medium flex items-center gap-1"
                              title="Download resume"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {uploadingCandidateId === c.id ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-xs"
                              >
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                  className="text-xs"
                                />
                                <button
                                  onClick={() => handleResumeUpload(c.id)}
                                  disabled={!resumeFile || uploading}
                                  className="text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Upload resume"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setUploadingCandidateId(null);
                                    setResumeFile(null);
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Cancel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </motion.div>
                            ) : (
                              <>
                                <span className="text-xs text-muted-foreground">No resume</span>
                                <button
                                  onClick={() => setUploadingCandidateId(c.id)}
                                  className="text-primary hover:underline text-xs font-medium flex items-center gap-1"
                                  title="Upload resume for this candidate"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  Upload
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
