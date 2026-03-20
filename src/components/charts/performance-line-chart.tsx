"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface PerformancePoint {
  attemptId: string;
  date: string;
  score: number;
  accuracy: number;
}

interface PerformanceLineChartProps {
  data: PerformancePoint[];
}

export function PerformanceLineChart({
  data
}: PerformanceLineChartProps): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 18% 80%)" />
          <XAxis dataKey="date" tickMargin={8} stroke="hsl(205 20% 35%)" />
          <YAxis tickMargin={8} stroke="hsl(205 20% 35%)" />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(200 15% 78%)",
              background: "hsl(0 0% 100%)"
            }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="hsl(191 82% 31%)"
            strokeWidth={3}
            dot={{ r: 4, fill: "hsl(191 82% 31%)" }}
            activeDot={{ r: 6 }}
            name="Aproveitamento (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
