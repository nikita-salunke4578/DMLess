import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJobs, fetchCandidatesForJob } from "@/lib/supabase-helpers";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserX, UserCheck, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { ChannelBreakdown } from "@/components/dashboard/ChannelBreakdown";
import { JobLinkShare } from "@/components/dashboard/JobLinkShare";
import { TimeAnalytics } from "@/components/dashboard/TimeAnalytics";
import {
  fetchDashboardStats,
  fetchChannelBreakdown,
  fetchTimeAnalytics,
  StatsData,
  ChannelData,
  CandidateAnalytics,
} from "@/lib/analytics-helpers";

interface JobWithStats {
  id: string;
  title: string;
  created_at: string;
  total: number;
  knockedOut: number;
  shortlisted: number;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<CandidateAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [stats, channels, timeData] = await Promise.all([
        fetchDashboardStats(),
        fetchChannelBreakdown(),
        fetchTimeAnalytics(),
      ]);

      setStatsData(stats);
      setChannelData(channels);
      setTimeAnalytics(timeData);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const jobsData = await fetchJobs();
      const jobsWithStats = await Promise.all(
        jobsData.map(async (job: any) => {
          const candidates = await fetchCandidatesForJob(job.id);
          return {
            id: job.id, title: job.title, created_at: job.created_at,
            total: candidates.length,
            knockedOut: candidates.filter((c: any) => c.status === "KNOCKED_OUT").length,
            shortlisted: candidates.filter((c: any) => c.status === "SHORTLISTED").length,
          };
        })
      );
      setJobs(jobsWithStats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + j.total, 0);
  const totalKnockedOut = jobs.reduce((sum, j) => sum + j.knockedOut, 0);
  const totalShortlisted = jobs.reduce((sum, j) => sum + j.shortlisted, 0);

  const chartData = jobs.map((j) => ({
    name: j.title.length > 15 ? j.title.slice(0, 15) + "…" : j.title,
    Shortlisted: j.shortlisted,
    "Knocked Out": j.knockedOut,
  }));

  const stats = [
    { label: "Total Applicants", value: totalApplicants, icon: Users, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { label: "Knocked Out", value: totalKnockedOut, icon: UserX, colorClass: "text-destructive", bgClass: "bg-destructive/10" },
    { label: "Shortlisted", value: totalShortlisted, icon: UserCheck, colorClass: "text-success", bgClass: "bg-success/10" },
    { label: "Active Jobs", value: jobs.length, icon: Briefcase, colorClass: "text-info", bgClass: "bg-info/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between page-header">
          <div>
            <h1 className="page-title font-display">Dashboard</h1>
            <p className="page-subtitle">Overview of your recruitment pipeline</p>
          </div>
          <Link to="/dashboard/jobs/new">
            <Button className="gradient-bg border-0 glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>

        {loading || analyticsLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Bar with Trends */}
            {statsData && (
              <StatsBar
                stats={[
                  {
                    label: "Total Applied",
                    value: statsData.totalApplied,
                    trend: statsData.trends.appliedTrend,
                    trendPositive: statsData.trends.appliedTrend >= 0,
                    bgColor: "bg-primary/5",
                    textColor: "text-primary",
                  },
                  {
                    label: "Knocked Out",
                    value: statsData.knockedOut,
                    trend: statsData.trends.knockedOutTrend,
                    trendPositive: statsData.trends.knockedOutTrend <= 0,
                    bgColor: "bg-destructive/5",
                    textColor: "text-destructive",
                  },
                  {
                    label: "Shortlisted",
                    value: statsData.shortlisted,
                    trend: statsData.trends.shortlistedTrend,
                    trendPositive: statsData.trends.shortlistedTrend >= 0,
                    bgColor: "bg-success/5",
                    textColor: "text-success",
                  },
                ]}
              />
            )}

            {/* Channel Breakdown */}
            <ChannelBreakdown data={channelData} loading={analyticsLoading} />

            {/* Time Analytics */}
            {timeAnalytics && (
              <TimeAnalytics data={timeAnalytics} loading={analyticsLoading} />
            )}

            {/* Jobs Bar Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="stat-card mb-8"
              >
                <h2 className="text-lg font-semibold font-display text-foreground mb-4">Candidates per Job</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          fontSize: 13,
                        }}
                      />
                      <Bar dataKey="Shortlisted" fill="hsl(152, 69%, 40%)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Knocked Out" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Job Link Share */}
            {jobs.length > 0 && (
              <JobLinkShare jobId={jobs[0]?.id} jobTitle={jobs[0]?.title} />
            )}

            {/* Recent Jobs Section */}
            {jobs.length === 0 ? (
              <div className="stat-card text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium font-display text-foreground mb-2">No jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first job to start screening candidates</p>
                <Link to="/dashboard/jobs/new">
                  <Button className="gradient-bg border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="stat-card"
              >
                <h2 className="text-lg font-semibold font-display text-foreground mb-4">Recent Jobs</h2>
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job) => (
                    <Link
                      key={job.id}
                      to={`/dashboard/jobs/${job.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="candidate-badge-shortlisted">{job.shortlisted} passed</span>
                        <span className="candidate-badge-knocked-out">{job.knockedOut} failed</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
