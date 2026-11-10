"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { useDemoStore } from "@/features/demo/demo-store";
import type { DemoSettings } from "@/types/domain";

const TABS = [
  "Profile",
  "Organization",
  "Departments",
  "Attendance rules",
  "QR & terminals",
  "Preferences",
] as const;

export function SettingsView() {
  const { settings, updateSettings, departments } = useDemoStore();
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Settings"
        description="Local demonstration preferences — nothing is sent to a server."
        actions={
          dirty ? (
            <span className="rounded bg-warning-muted px-3 py-1 text-xs font-bold text-amber-900">
              Unsaved changes (session)
            </span>
          ) : null
        }
      />

      <p className="text-xs text-text-secondary">
        Tous les réglages ci-dessous sont appliqués localement dans cette session.
      </p>

      <SettingsTabs tab={tab} onTab={setTab} />

      <section className="rounded bg-surface p-6">
        {tab === "Profile" ? (
          <SettingsGrid
            fields={[
              [
                "Name",
                settings.profile.name,
                (v) => {
                  markDirty();
                  updateSettings({ profile: { ...settings.profile, name: v } });
                },
              ],
              [
                "Email",
                settings.profile.email,
                (v) => {
                  markDirty();
                  updateSettings({ profile: { ...settings.profile, email: v } });
                },
              ],
              [
                "Phone",
                settings.profile.phone,
                (v) => {
                  markDirty();
                  updateSettings({ profile: { ...settings.profile, phone: v } });
                },
              ],
              [
                "Timezone",
                settings.profile.timezone,
                (v) => {
                  markDirty();
                  updateSettings({ profile: { ...settings.profile, timezone: v } });
                },
              ],
            ]}
          />
        ) : null}

        {tab === "Organization" ? (
          <SettingsGrid
            fields={[
              [
                "Display name",
                settings.organization.name,
                (v) => {
                  markDirty();
                  updateSettings({
                    organization: { ...settings.organization, name: v },
                  });
                },
              ],
              [
                "Legal name",
                settings.organization.legalName,
                (v) => {
                  markDirty();
                  updateSettings({
                    organization: { ...settings.organization, legalName: v },
                  });
                },
              ],
              [
                "Campus",
                settings.organization.campus,
                (v) => {
                  markDirty();
                  updateSettings({
                    organization: { ...settings.organization, campus: v },
                  });
                },
              ],
              [
                "Address",
                settings.organization.address,
                (v) => {
                  markDirty();
                  updateSettings({
                    organization: { ...settings.organization, address: v },
                  });
                },
              ],
              [
                "Support email",
                settings.organization.supportEmail,
                (v) => {
                  markDirty();
                  updateSettings({
                    organization: { ...settings.organization, supportEmail: v },
                  });
                },
              ],
            ]}
          />
        ) : null}

        {tab === "Departments" ? (
          <ul className="space-y-3">
            {departments.map((d) => (
              <li key={d.id} className="rounded bg-muted/70 p-4 text-sm">
                <p className="font-bold">{d.name}</p>
                <p className="text-text-secondary">
                  {d.headcount} employees · {d.campus} · Target {d.targetAttendanceRate}%
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "Attendance rules" ? (
          <AttendanceRulesForm
            rules={settings.attendanceRules}
            onChange={(patch) => {
              markDirty();
              updateSettings({
                attendanceRules: { ...settings.attendanceRules, ...patch },
              });
            }}
          />
        ) : null}

        {tab === "QR & terminals" ? (
          <QrRulesForm
            qr={settings.qrTerminal}
            onChange={(patch) => {
              markDirty();
              updateSettings({ qrTerminal: { ...settings.qrTerminal, ...patch } });
            }}
          />
        ) : null}

        {tab === "Preferences" ? (
          <AppPrefsForm
            app={settings.app}
            onChange={(patch) => {
              markDirty();
              updateSettings({ app: { ...settings.app, ...patch } });
            }}
          />
        ) : null}

        <SettingsFooter
          dirty={dirty}
          onApply={() => {
            push({
              tone: "info",
              title: "Settings applied locally",
              description: "Reloading the page resets demonstration data.",
            });
            setDirty(false);
          }}
        />
      </section>
    </div>
  );
}

function SettingsTabs({
  tab,
  onTab,
}: {
  tab: (typeof TABS)[number];
  onTab: (t: (typeof TABS)[number]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded bg-muted p-1" role="tablist">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={tab === t}
          onClick={() => onTab(t)}
          className={
            tab === t
              ? "rounded bg-surface px-3 py-1.5 text-xs font-bold text-primary"
              : "rounded px-3 py-1.5 text-xs font-medium text-text-secondary"
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SettingsGrid({
  fields,
}: {
  fields: [string, string, (v: string) => void][];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, value, onChange]) => (
        <LabeledInput key={label} label={label} value={value} onChange={onChange} />
      ))}
    </div>
  );
}

function AttendanceRulesForm({
  rules,
  onChange,
}: {
  rules: DemoSettings["attendanceRules"];
  onChange: (patch: Partial<DemoSettings["attendanceRules"]>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LabeledInput
        label="Workday start"
        value={rules.workdayStart}
        onChange={(v) => onChange({ workdayStart: v })}
      />
      <LabeledInput
        label="Workday end"
        value={rules.workdayEnd}
        onChange={(v) => onChange({ workdayEnd: v })}
      />
      <LabeledInput
        label="Late grace (minutes)"
        type="number"
        value={String(rules.lateGraceMinutes)}
        onChange={(v) => onChange({ lateGraceMinutes: Number(v) || 0 })}
      />
      <ToggleRow
        label="Geofence enforced"
        checked={rules.geofenceEnforced}
        onChange={(checked) => onChange({ geofenceEnforced: checked })}
      />
      <ToggleRow
        label="Remote missions"
        checked={rules.remoteMissionsEnabled}
        onChange={(checked) => onChange({ remoteMissionsEnabled: checked })}
      />
    </div>
  );
}

function QrRulesForm({
  qr,
  onChange,
}: {
  qr: DemoSettings["qrTerminal"];
  onChange: (patch: Partial<DemoSettings["qrTerminal"]>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LabeledInput
        label="Rotation interval (min)"
        type="number"
        value={String(qr.rotationIntervalMinutes)}
        onChange={(v) => onChange({ rotationIntervalMinutes: Number(v) || 15 })}
      />
      <LabeledInput
        label="Protocol version"
        value={qr.protocolVersion}
        onChange={(v) => onChange({ protocolVersion: v })}
      />
      <ToggleRow
        label="Dynamic QR"
        checked={qr.dynamicQrEnabled}
        onChange={(checked) => onChange({ dynamicQrEnabled: checked })}
      />
    </div>
  );
}

function AppPrefsForm({
  app,
  onChange,
}: {
  app: DemoSettings["app"];
  onChange: (patch: Partial<DemoSettings["app"]>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold text-text-secondary">
        Locale
        <Select
          className="mt-1 w-full"
          value={app.locale}
          onChange={(e) => onChange({ locale: e.target.value })}
        >
          <option value="en-US">English (US)</option>
          <option value="fr-FR">Français</option>
        </Select>
      </label>
      <label className="text-xs font-semibold text-text-secondary">
        Density
        <Select
          className="mt-1 w-full"
          value={app.density}
          onChange={(e) =>
            onChange({ density: e.target.value as DemoSettings["app"]["density"] })
          }
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </Select>
      </label>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-xs font-semibold text-text-secondary">
      {label}
      <Input
        className="mt-1"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded bg-muted/60 px-3 py-3 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded accent-primary"
      />
    </label>
  );
}

function SettingsFooter({
  dirty,
  onApply,
}: {
  dirty: boolean;
  onApply: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-4">
      <Button variant="secondary" disabled={!dirty} onClick={onApply}>
        Apply locally
      </Button>
    </div>
  );
}
