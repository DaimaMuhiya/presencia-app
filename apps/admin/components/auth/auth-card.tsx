import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <section
      className="relative w-full rounded-[32px] border border-white/20 bg-white/70 px-[33px] pb-[33px] pt-[49.5px] shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.08)] backdrop-blur-[8px]"
      aria-labelledby="auth-card-heading"
    >
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2
            id="auth-card-heading"
            className="font-display text-2xl font-bold leading-8 text-text-primary"
          >
            {title}
          </h2>
          <p className="text-sm leading-5 text-text-secondary">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}