import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJobs, deleteJob, fetchCandidatesForJob } from "@/lib/supabase-helpers";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Copy } from "lucide-react";
import { motion } from "framer-motion";

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const data = await fetchJobs();
      const withStats = await Promise.all(
        data.map(async (job: any) => {
          const candidates = await fetchCandidatesForJob(job.id);
          return { ...job, candidateCount: candidates.length };
        })
      );
      setJobs(withStats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Delete this job and all its data?")) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast({ title: "Job deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyLink = (jobId: string) => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between page-header">
          <div>
            <h1 className="page-title font-display">Jobs</h1>
            <p className="page-subtitle">Manage your open positions</p>
          </div>
          <Link to="/dashboard/jobs/new">
            <Button className="gradient-bg border-0 glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground mb-4">No jobs created yet</p>
            <Link to="/dashboard/jobs/new">
              <Button className="gradient-bg border-0">Create your first job</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="stat-card flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <Link to={`/dashboard/jobs/${job.id}`} className="font-semibold font-display text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{job.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.candidateCount} applicant{job.candidateCount !== 1 ? "s" : ""} · Created {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => copyLink(job.id)}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Link
                  </Button>
                  <Link to={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(job.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
