import {
  DEMO_TREND_CALLOUTS,
  DEMO_TREND_POINTS,
} from "@/features/dashboard/demo-data";

const LEGEND = [
  { label: "Present", color: "#00236F" },
  { label: "Absent", color: "#F43F5E" },
  { label: "Late", color: "#F59E0B" },
] as const;

function scale(value: number, max: number, height: number) {
  return height - (value / max) * (height - 16);
}

export function DashboardTrendPanel() {
  const w = 520;
  const h = 180;
  const max = Math.max(...DEMO_TREND_POINTS.map((p) => p.present));
  const step = w / (DEMO_TREND_POINTS.length - 1);

  const presentPath = DEMO_TREND_POINTS.map((p, i) => {
    const x = i * step;
    const y = scale(p.present, max, h);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const areaPath = `${presentPath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <article className="rounded bg-surface p-6 lg:col-span-2">
      <TrendPanelHeader />

      <div className="relative mt-4 overflow-hidden rounded bg-muted/50 p-4">
        <svg
          viewBox={`0 0 ${w} ${h + 24}`}
          className="h-auto w-full"
          role="img"
          aria-label="Graphique de tendance des présences (démo)"
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={0}
              x2={w}
              y1={h * t}
              y2={h * t}
              stroke="rgba(197,197,211,0.35)"
              strokeDasharray="4 4"
            />
          ))}
          <path d={areaPath} fill="rgba(0,35,111,0.15)" />
          <path
            d={presentPath}
            fill="none"
            stroke="#00236F"
            strokeWidth={2.5}
          />
          {DEMO_TREND_POINTS.map((p, i) => {
            const x = i * step;
            const y = scale(p.present, max, h);
            const isToday = i === DEMO_TREND_POINTS.length - 1;
            return (
              <circle
                key={p.label}
                cx={x}
                cy={y}
                r={isToday ? 5 : 3.5}
                fill="#00236F"
                stroke={isToday ? "#fff" : "none"}
                strokeWidth={2}
              />
            );
          })}
          {DEMO_TREND_POINTS.map((p, i) => (
            <text
              key={`${p.label}-x`}
              x={i * step}
              y={h + 18}
              textAnchor="middle"
              fill="#515F74"
              fontSize={10}
              fontWeight={600}
            >
              {p.label}
            </text>
          ))}
        </svg>

        <div className="absolute right-4 top-4 rounded bg-primary px-2.5 py-2 text-white shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#b6c4ff]">
            Today snapshot
          </p>
          <p className="text-xs font-bold">422 present · 38 absent</p>
          <p className="mt-0.5 flex gap-3 text-[10px] text-[#e6e8ea]">
            <span>+2.1%</span>
            <span>20 late</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {DEMO_TREND_CALLOUTS.map((c) => (
          <div key={c.label} className="rounded bg-muted px-3 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
              {c.label}
            </p>
            <p className="mt-1 text-sm font-bold text-text-primary">{c.value}</p>
            <p
              className={
                c.hintTone === "green"
                  ? "text-[11px] font-semibold text-success-dark"
                  : "text-[11px] text-text-secondary"
              }
            >
              {c.hint}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TrendPanelHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">
          Attendance Evolution & Velocity
        </h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          Real-time and historical presence across campuses
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-3">
          {LEGEND.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary"
            >
              <span
                className="size-2.5 rounded"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <div className="inline-flex rounded bg-muted p-1">
          {["7", "15", "30"].map((d, i) => (
            <button
              key={d}
              type="button"
              disabled
              className={
                i === 0
                  ? "rounded bg-surface px-2.5 py-1 text-[11px] font-semibold text-primary"
                  : "rounded px-2.5 py-1 text-[11px] font-semibold text-text-secondary"
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
