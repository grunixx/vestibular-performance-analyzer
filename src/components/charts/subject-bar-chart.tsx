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

interface SubjectDatum {
  subject: string;
  accuracy: number;
  correct: number;
  wrong: number;
}

interface SubjectBarChartProps {
  data: SubjectDatum[];
}

export const SubjectBarChart = memo(function SubjectBarChart({
  data
}: SubjectBarChartProps): JSX.Element {
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
            dataKey="subject"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.9rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              boxShadow: "0 14px 30px -20px hsl(var(--shadow) / 0.9)"
            }}
            formatter={(value) => [`${value}%`, "Acurácia"]}
          />
          <Bar
            dataKey="accuracy"
            fill="hsl(var(--chart-2))"
            radius={[10, 10, 4, 4]}
            animationDuration={650}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
