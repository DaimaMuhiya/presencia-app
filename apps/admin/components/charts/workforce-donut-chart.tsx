"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { WorkforceSnapshot } from "@/types/domain";

type WorkforceDonutChartProps = {
  workforce: WorkforceSnapshot;
};

const COLORS = {
  onTime: "#00236F",
  late: "#F59E0B",
  remote: "#3B82F6",
  leave: "#515F74",
  unexcused: "#F43F5E",
} as const;

export function WorkforceDonutChart({ workforce }: WorkforceDonutChartProps) {
  const data = [
    { name: "On-Time", value: workforce.onTimeArrivals, color: COLORS.onTime },
    { name: "Late", value: workforce.lateArrivals, color: COLORS.late },
    { name: "Remote", value: workforce.remoteMissions, color: COLORS.remote },
    { name: "Leave", value: workforce.plannedLeave, color: COLORS.leave },
    {
      name: "Unexcused",
      value: workforce.unexcusedAbsences,
      color: COLORS.unexcused,
    },
  ];

  return (
    <div className="relative h-48 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, "Employees"]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-extrabold text-text-primary">
          {workforce.totalWorkforce}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
          Tracked
        </p>
      </div>
    </div>
  );
}
