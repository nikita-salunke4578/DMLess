import { motion } from "framer-motion";
import { Clock, TrendingUp, PercentSquare, Target } from "lucide-react";
import { CandidateAnalytics } from "@/lib/analytics-helpers";

interface TimeAnalyticsProps {
  data: CandidateAnalytics;
  loading?: boolean;
}

export function TimeAnalytics({ data, loading }: TimeAnalyticsProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Time Analytics</h3>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      icon: Clock,
      label: "Average Time",
      value: `${data.totalTime} min`,
      subtext: `${data.averageTimePerQuestion}m per question`,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: TrendingUp,
      label: "Average Score",
      value: `${data.averageScore}/5`,
      subtext: `${(data.averageScore * 100) / 5}% correct`,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      icon: PercentSquare,
      label: "Completion Rate",
      value: `${data.completionRate}%`,
      subtext: "of candidates completed quiz",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      icon: Target,
      label: "Shortlist Rate",
      value: `${data.completionRate > 0 ? ((data.averageScore / 5) * 100).toFixed(1) : 0}%`,
      subtext: "passed the screening",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">Time Analytics</h3>
      <p className="text-xs text-muted-foreground mb-6">Average time, score, and completion metrics</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-lg p-4 border border-border/50 ${metric.bgColor}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-md ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold font-display text-foreground mb-1">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.subtext}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
