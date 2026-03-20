"use client";

import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ErrorDatum {
  label: string;
  value: number;
}

interface ErrorPieChartProps {
  data: ErrorDatum[];
}

const COLORS = [
  "hsl(var(--chart-5))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--primary))"
];

export const ErrorPieChart = memo(function ErrorPieChart({
  data
}: ErrorPieChartProps): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={98}
            innerRadius={48}
            paddingAngle={2}
            animationDuration={650}
          >
            {data.map((_, index) => (
              <Cell key={`error-cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "0.9rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              boxShadow: "0 14px 30px -20px hsl(var(--shadow) / 0.9)"
            }}
            formatter={(value) => [value, "Ocorrências"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
