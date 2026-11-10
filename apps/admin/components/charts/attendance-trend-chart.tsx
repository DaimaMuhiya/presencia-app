"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendChartPoint = {
  label: string;
  present: number;
  absent: number;
  late: number;
};

type AttendanceTrendChartProps = {
  data: TrendChartPoint[];
};

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <div className="h-52 w-full min-w-0 sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(197,197,211,0.35)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#515F74", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#515F74" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e8edf3",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            fill="rgba(0,35,111,0.12)"
            stroke="#00236F"
            strokeWidth={2}
            dot={{ r: 3, fill: "#00236F" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#F43F5E"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="late"
            name="Late"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
