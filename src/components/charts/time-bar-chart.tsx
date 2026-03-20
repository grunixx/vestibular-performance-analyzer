"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface TimeBarDatum {
  question: string;
  timeSeconds: number;
}

interface TimeBarChartProps {
  data: TimeBarDatum[];
}

function toMinutes(seconds: number): string {
  return `${(seconds / 60).toFixed(1)} min`;
}

export const TimeBarChart = memo(function TimeBarChart({
  data
}: TimeBarChartProps): JSX.Element {
  const axisTick = {
    fill: "hsl(var(--chart-axis))",
    fontSize: 12
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="4 6"
            vertical={false}
            stroke="hsl(var(--chart-grid))"
          />
          <XAxis
            dataKey="question"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.9rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              boxShadow: "0 14px 30px -20px hsl(var(--shadow) / 0.9)"
            }}
            formatter={(value) => [toMinutes(Number(value)), "Tempo de resolução"]}
          />
          <Bar
            dataKey="timeSeconds"
            fill="hsl(var(--chart-3))"
            radius={[10, 10, 4, 4]}
            animationDuration={650}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
