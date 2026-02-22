import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchAllCandidates, getResumeDownloadUrl, uploadResumeForCandidate } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Users, UserCheck, UserX, Search, Upload, X, Calendar } from "lucide-react";
import { motion } from "framer-motion";


type FilterStatus = "ALL" | "SHORTLISTED" | "KNOCKED_OUT";

interface CandidateWithJob {
  id: string;
  name: string;
  email: string;
  status: string;
  score: number;
  resume_url: string | null;
  created_at: string;
  jobs: { title: string };
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingCandidateId, setUploadingCandidateId] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<CandidateWithJob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await fetchAllCandidates();
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading candidates",
        description: "Failed to fetch candidates data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.jobs?.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const downloadResume = async (resumeUrl: string, candidateName: string) => {
    try {
      const url = await getResumeDownloadUrl(resumeUrl);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${candidateName}-resume.pdf`;
      a.click();
      toast({ title: "Resume downloaded successfully" });
    } catch (err: any) {
      toast({
        title: "Error downloading",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const viewResumeInNewTab = async (resumeUrl: string) => {
    try {
      const url = await getResumeDownloadUrl(resumeUrl);
      window.open(url, "_blank");
    } catch (err: any) {
      toast({
        title: "Error opening resume",
        description: err.message,
        variant: "destructive",
      });
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
      loadCandidates();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const exportCSV = () => {
    const filtered = filterCandidates();
    if (filtered.length === 0) {
      toast({ title: "No candidates to export" });
      return;
    }

    const csv = ["Name,Email,Job,Score,Status,Date"]
      .concat(
        filtered.map(
          (c) =>
            `"${c.name}","${c.email}","${c.jobs?.title || "N/A"}",${c.score},"${c.status}","${new Date(
              c.created_at
            ).toLocaleDateString()}"`
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${filterStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Candidates exported successfully" });
  };

  const filteredCandidates = filterCandidates();
  const total = candidates.length;
  const shortlisted = candidates.filter((c) => c.status === "SHORTLISTED").length;
  const knockedOut = candidates.filter((c) => c.status === "KNOCKED_OUT").length;

  const stats = [
    { label: "Total Candidates", value: total, icon: Users, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { label: "Shortlisted", value: shortlisted, icon: UserCheck, colorClass: "text-green-600", bgClass: "bg-green-600/10" },
    { label: "Knocked Out", value: knockedOut, icon: UserX, colorClass: "text-red-600", bgClass: "bg-red-600/10" },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="page-header mb-8">
          <div>
            <h1 className="page-title font-display">Candidates & Resumes</h1>
            <p className="page-subtitle">View and manage all candidate resumes from your job openings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`h-9 w-9 rounded-lg ${s.bgClass} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.colorClass}`} />
                </div>
              </div>
              <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="stat-card"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold font-display text-foreground mb-4">All Candidates</h2>

              {/* Search Bar */}
              <div className="mb-6 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 border-b pb-4 flex-wrap">
                {[
                  { label: "All", value: "ALL" as FilterStatus, count: total },
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

              {/* Export Button */}
              <div className="mb-6">
                <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export as CSV
                </Button>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No candidates yet. Share job links to start receiving applications.</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No candidates found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date Applied</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c, idx) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{c.email}</td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{c.jobs?.title || "N/A"}</td>
                        <td className="py-3 px-4 text-foreground font-semibold">{c.score}/5</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${c.status === "SHORTLISTED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                          >
                            {c.status === "SHORTLISTED" ? "✓" : "✗"}
                            {c.status === "SHORTLISTED" ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          {c.resume_url ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewResumeInNewTab(c.resume_url!)}
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="View resume"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => downloadResume(c.resume_url!, c.name)}
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Download resume"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              {c.status === "SHORTLISTED" && (
                                <button
                                  onClick={() => {
                                    setSelectedCandidateForInterview(c);
                                    setScheduleModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Schedule interview"
                                >
                                  <Calendar className="h-4 w-4" />
                                </button>
                              )}
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
                                    className="text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Upload resume"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUploadingCandidateId(null);
                                      setResumeFile(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </motion.div>
                              ) : (
                                <>
                                  <span className="text-xs text-muted-foreground">No resume</span>
                                  <button
                                    onClick={() => setUploadingCandidateId(c.id)}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                    title="Upload resume for this candidate"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Showing {filteredCandidates.length} of {total} candidate{total !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </motion.div>
        )}


      </div>
    </DashboardLayout>
  );
}
