"use client";

import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts";
import { DashboardDepartments } from "@/components/dashboard/dashboard-departments";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { DashboardLiveTable } from "@/components/dashboard/dashboard-live-table";
import { DashboardTrendPanel } from "@/components/dashboard/dashboard-trend-panel";
import { DashboardWelcomeControls } from "@/components/dashboard/dashboard-welcome-controls";
import { DashboardWorkforcePanel } from "@/components/dashboard/dashboard-workforce-panel";
import { buildDashboardKpis } from "@/features/dashboard/selectors";
import { useDemoStore } from "@/features/demo/demo-store";

export function DashboardPageContent() {
  const { workforce } = useDemoStore();
  const kpis = buildDashboardKpis(workforce);

  return (
    <div className="flex flex-col gap-8">
      <DashboardWelcomeControls />

      <section
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        aria-label="Indicateurs clés"
      >
        {kpis.map((kpi) => (
          <DashboardKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <section
        className="grid gap-5 lg:grid-cols-3"
        aria-label="Analyses et tendances"
      >
        <DashboardTrendPanel />
        <DashboardWorkforcePanel />
      </section>

      <section
        className="grid gap-5 lg:grid-cols-5"
        aria-label="Départements et alertes"
      >
        <DashboardDepartments />
        <DashboardAlerts />
      </section>

      <DashboardLiveTable />
    </div>
  );
}
