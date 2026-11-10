"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { useDemoStore } from "@/features/demo/demo-store";
import type { QrCodeRecord, TerminalStatus } from "@/types/domain";

export function QrManagementView() {
  const {
    qrCodes,
    terminals,
    checkpoints,
    addQrCode,
    updateQrCode,
    updateTerminal,
  } = useDemoStore();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [terminalFilter, setTerminalFilter] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [preview, setPreview] = useState<QrCodeRecord | null>(null);
  const [detailTerminal, setDetailTerminal] = useState<string | null>(null);

  const [genTerminal, setGenTerminal] = useState(terminals[0]?.id ?? "");
  const [genLabel, setGenLabel] = useState("");

  const filteredQr = useMemo(() => {
    return qrCodes.filter((qr) => {
      if (statusFilter !== "all" && qr.status !== statusFilter) return false;
      if (terminalFilter !== "all" && qr.terminalId !== terminalFilter)
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !qr.label.toLowerCase().includes(q) &&
          !qr.token.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [qrCodes, search, statusFilter, terminalFilter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="QR Access Management"
        description="Inventory, terminal health and simulated QR generation."
        actions={
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="size-4" />
            Generate QR
          </Button>
        }
      />

      <QrFiltersBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatus={setStatusFilter}
        terminalFilter={terminalFilter}
        onTerminal={setTerminalFilter}
        terminals={terminals}
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded bg-surface p-5">
          <h2 className="font-display text-base font-bold">QR inventory</h2>
          <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
            {filteredQr.map((qr) => (
              <li
                key={qr.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded bg-muted/70 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{qr.label}</p>
                  <p className="text-xs text-text-secondary">{qr.token}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={qr.status}
                    tone={qr.status === "active" ? "green" : qr.status === "rotated" ? "amber" : "rose"}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setPreview(qr)}>
                    Preview
                  </Button>
                  {qr.status === "active" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateQrCode(qr.id, {
                          status: "rotated",
                          rotatedAt: new Date().toISOString(),
                        });
                        push({ tone: "success", title: "QR rotated (session)" });
                      }}
                    >
                      Rotate
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded bg-surface p-5">
          <h2 className="font-display text-base font-bold">Terminals</h2>
          <ul className="mt-4 space-y-2">
            {terminals.map((terminal) => {
              const checkpoint = checkpoints.find(
                (c) => c.id === terminal.checkpointId
              );
              return (
                <li
                  key={terminal.id}
                  className="rounded bg-muted/70 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{terminal.name}</p>
                      <p className="text-xs text-text-secondary">
                        {terminal.location} · {checkpoint?.name}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        Sync {new Date(terminal.lastSyncAt).toLocaleTimeString()} ·{" "}
                        {terminal.firmware}
                      </p>
                    </div>
                    <StatusBadge
                      label={terminal.status}
                      tone={
                        terminal.status === "online"
                          ? "green"
                          : terminal.status === "degraded"
                            ? "amber"
                            : "rose"
                      }
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailTerminal(terminal.id)}
                    >
                      Configure
                    </Button>
                    <Select
                      className="h-8 text-xs"
                      value={terminal.status}
                      onChange={(e) => {
                        updateTerminal(terminal.id, {
                          status: e.target.value as TerminalStatus,
                        });
                        push({
                          tone: "info",
                          title: "Terminal status updated (session)",
                        });
                      }}
                    >
                      <option value="online">Online</option>
                      <option value="degraded">Degraded</option>
                      <option value="offline">Offline</option>
                    </Select>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      <Dialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate QR pass"
        description="Token is generated locally — not persisted to a backend."
      >
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-text-secondary">
            Label
            <Input
              className="mt-1"
              value={genLabel}
              onChange={(e) => setGenLabel(e.target.value)}
              placeholder="Entrance pass label"
            />
          </label>
          <label className="block text-xs font-semibold text-text-secondary">
            Terminal
            <Select
              className="mt-1 w-full"
              value={genTerminal}
              onChange={(e) => setGenTerminal(e.target.value)}
            >
              {terminals.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </label>
          <Button
            onClick={() => {
              if (!genLabel.trim()) {
                push({ tone: "error", title: "Label required" });
                return;
              }
              const terminal = terminals.find((t) => t.id === genTerminal);
              if (!terminal) return;
              const record: QrCodeRecord = {
                id: `qr-new-${Date.now()}`,
                label: genLabel,
                token: `PRS-GEN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
                terminalId: terminal.id,
                checkpointId: terminal.checkpointId,
                status: "active",
                createdAt: new Date().toISOString(),
                scanCount: 0,
              };
              addQrCode(record);
              setGenerateOpen(false);
              setGenLabel("");
              setPreview(record);
              push({ tone: "success", title: "QR generated (session)" });
            }}
          >
            Generate
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title="QR preview"
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <QRCodeSVG value={preview.token} size={200} fgColor="#00236F" />
            <p className="text-sm font-semibold">{preview.label}</p>
            <p className="text-xs text-text-secondary">{preview.token}</p>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(detailTerminal)}
        onClose={() => setDetailTerminal(null)}
        title="Terminal configuration"
      >
        {detailTerminal ? (
          <p className="text-sm text-text-secondary">
            Checkpoint association and geofence are read from demo fixtures.
            Adjust status from the terminal list — changes stay in this session.
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}

function QrFiltersBar(props: {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatus: (v: string) => void;
  terminalFilter: string;
  onTerminal: (v: string) => void;
  terminals: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded bg-surface p-4 sm:flex-row">
      <label className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        <Input
          className="pl-10"
          placeholder="Search QR or token..."
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
        />
      </label>
      <Select value={props.statusFilter} onChange={(e) => props.onStatus(e.target.value)}>
        <option value="all">All QR status</option>
        <option value="active">Active</option>
        <option value="rotated">Rotated</option>
        <option value="revoked">Revoked</option>
      </Select>
      <Select
        value={props.terminalFilter}
        onChange={(e) => props.onTerminal(e.target.value)}
      >
        <option value="all">All terminals</option>
        {props.terminals.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
