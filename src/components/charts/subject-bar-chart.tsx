"use client";

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

export function SubjectBarChart({ data }: SubjectBarChartProps): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 18% 80%)" />
          <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(205 20% 35%)" />
          <YAxis stroke="hsl(205 20% 35%)" />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(200 15% 78%)",
              background: "hsl(0 0% 100%)"
            }}
          />
          <Bar dataKey="accuracy" fill="hsl(163 72% 32%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
