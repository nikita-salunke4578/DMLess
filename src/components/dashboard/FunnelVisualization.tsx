import { motion } from "framer-motion";
import { FunnelData } from "@/lib/analytics-helpers";

interface FunnelVisualizationProps {
  data: FunnelData[];
  loading?: boolean;
}

export function FunnelVisualization({ data, loading }: FunnelVisualizationProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Funnel Visualization</h3>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Funnel Visualization</h3>
        <p className="text-muted-foreground text-sm text-center py-12">No data available yet</p>
      </div>
    );
  }

  const maxCompleted = Math.max(...data.map(d => d.completed), 1);

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">Funnel Visualization</h3>
      <p className="text-xs text-muted-foreground mb-6">Visual bar showing candidate drop-off at each question</p>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 text-xs font-semibold text-muted-foreground">Q{index + 1}</div>
              <div className="flex-1">
                <div className="bg-muted rounded-full h-8 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-end pr-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.completed / maxCompleted) * 100}%` }}
                    transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
                  >
                    <span className="text-xs font-semibold text-primary-foreground">
                      {item.completed}
                    </span>
                  </motion.div>
                </div>
              </div>
              <div className="w-16 text-right">
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.dropoffPercentage.toFixed(0)}% drop-off
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 pl-16">{item.question}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
