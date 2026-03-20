"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ErrorDatum {
  label: string;
  value: number;
}

interface ErrorPieChartProps {
  data: ErrorDatum[];
}

const COLORS = [
  "hsl(7 78% 55%)",
  "hsl(33 88% 53%)",
  "hsl(191 82% 38%)",
  "hsl(163 72% 35%)",
  "hsl(225 63% 44%)",
  "hsl(45 93% 47%)"
];

export function ErrorPieChart({ data }: ErrorPieChartProps): JSX.Element {
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
          >
            {data.map((_, index) => (
              <Cell
                key={`error-cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(200 15% 78%)",
              background: "hsl(0 0% 100%)"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
