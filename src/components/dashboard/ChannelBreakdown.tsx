import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { ChannelData } from "@/lib/analytics-helpers";

interface ChannelBreakdownProps {
  data: ChannelData[];
  loading?: boolean;
}

export function ChannelBreakdown({ data, loading }: ChannelBreakdownProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Channel Breakdown</h3>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">Channel Breakdown</h3>
        <p className="text-muted-foreground text-sm text-center py-12">No data available yet</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold font-display text-foreground mb-2">Channel Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-6">Source of candidates</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center gap-3">
          {data.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / total) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
