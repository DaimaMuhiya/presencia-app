"use client";

import type { ReactNode } from "react";
import { DemoStoreProvider } from "@/features/demo/demo-store";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DemoStoreProvider>{children}</DemoStoreProvider>
    </ToastProvider>
  );
}
