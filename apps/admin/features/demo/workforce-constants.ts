export const DEMO_WORKFORCE = {
  totalWorkforce: 480,
  onTimeArrivals: 402,
  lateArrivals: 20,
  physicalAttendance: 402 + 20,
  remoteMissions: 20,
  plannedLeave: 26,
  unexcusedAbsences: 12,
} as const;

export const DEMO_ABSENT_TODAY =
  DEMO_WORKFORCE.plannedLeave + DEMO_WORKFORCE.unexcusedAbsences;

export const DEMO_PRESENT_RATE =
  (DEMO_WORKFORCE.physicalAttendance / DEMO_WORKFORCE.totalWorkforce) * 100;
