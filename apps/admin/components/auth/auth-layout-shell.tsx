import type { ReactNode } from "react";

import { AuthBranding } from "./auth-branding";

export function AuthLayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div
        className="pointer-events-none absolute inset-[-10%_70%_70%_-10%] rounded-full bg-[rgba(0,35,111,0.05)] blur-[60px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[60%_-10%_-10%_60%] rounded-full bg-[rgba(30,58,138,0.1)] blur-[75px]"
        aria-hidden
      />
      <div className="relative flex w-full max-w-[448px] flex-col gap-8">
        <AuthBranding />
        {children}
      </div>
    </div>
  );
}