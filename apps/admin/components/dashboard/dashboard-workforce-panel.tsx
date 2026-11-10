import {
  DEMO_ARRIVAL_WINDOWS,
  DEMO_WORKFORCE_SLICES,
} from "@/features/dashboard/demo-data";

const total = DEMO_WORKFORCE_SLICES.reduce((s, x) => s + x.value, 0);

function DonutChart() {
  const r = 70;
  const c = 2 * Math.PI * r;
  const segments = DEMO_WORKFORCE_SLICES.reduce<
    { slice: (typeof DEMO_WORKFORCE_SLICES)[number]; len: number; offset: number }[]
  >((acc, slice) => {
    const len = (slice.value / total) * c;
    const offset = acc.reduce((sum, item) => sum + item.len, 0);
    acc.push({ slice, len, offset });
    return acc;
  }, []);

  return (
    <div className="relative flex items-center justify-center py-2">
      <svg width={176} height={176} viewBox="0 0 176 176" aria-hidden>
        <circle
          cx={88}
          cy={88}
          r={r}
          fill="none"
          stroke="#F2F4F6"
          strokeWidth={21}
        />
        {segments.map(({ slice, len, offset }) => (
          <circle
            key={slice.label}
            cx={88}
            cy={88}
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth={21}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 88 88)"
          />
        ))}
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-2xl font-extrabold text-text-primary">
          {total}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-tight text-text-secondary">
          Tracked
        </p>
      </div>
    </div>
  );
}

export function DashboardWorkforcePanel() {
  return (
    <article className="rounded bg-surface p-6">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Workforce Status
          </h3>
          <p className="text-xs text-text-secondary">
            Real-time status breakdown
          </p>
        </div>
        <span className="text-xs font-bold text-text-secondary">Today</span>
      </header>

      <DonutChart />

      <div className="mt-2 grid grid-cols-2 gap-2">
        {DEMO_WORKFORCE_SLICES.map((slice) => (
          <div
            key={slice.label}
            className="flex items-center justify-between rounded bg-muted px-2 py-2 text-xs"
          >
            <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
              <span
                className="size-2.5 rounded"
                style={{ background: slice.color }}
              />
              {slice.label}
            </span>
            <span className="font-bold text-text-primary">{slice.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
          Arrival timing windows
        </p>
        <ul className="space-y-2">
          {DEMO_ARRIVAL_WINDOWS.map((row) => (
            <li key={row.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-bold text-text-primary">{row.percent}</span>
              </div>
              <div className="relative h-1.5 rounded bg-[#e6e8ea]">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${row.width}%`,
                    background:
                      row.tone === "blue"
                        ? "#00236F"
                        : row.tone === "indigo"
                          ? "#1E3A8A"
                          : "#F59E0B",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
