import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  trend?: number;
  bgColor: string;
  textColor: string;
  trendPositive?: boolean;
}

interface StatsBarProps {
  stats: StatItem[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className={`rounded-lg p-6 border border-border/50 backdrop-blur-sm ${stat.bgColor}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold font-display ${stat.textColor}`}>{stat.value}</p>
            </div>
            {stat.trend !== undefined && stat.trend !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${stat.trendPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
                }`}>
                {stat.trendPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span className="text-xs font-semibold">{Math.abs(stat.trend).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
