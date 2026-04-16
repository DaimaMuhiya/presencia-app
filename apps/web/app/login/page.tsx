import Link from "next/link";
import { loginAction } from "./actions";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="14"
      viewBox="0 0 17 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.5 2.5h14v9h-14v-9Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 3.5 8.5 8l7-4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2"
        y="8"
        width="10"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4 8V5.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FingerprintIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="30"
      viewBox="0 0 28 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 4C9 4 5 8 5 13v4M5 21v2M9 9v11M9 24v2M13 6v18M17 9v11M17 24v2M21 13v4M21 21v2M23 10c1 2 1.5 4 1.5 6v4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center bg-[#f7f9fb] p-6">
      <div
        className="pointer-events-none absolute inset-[-10%_70%_70%_-10%] rounded-full bg-[rgba(0,35,111,0.05)] blur-[60px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[60%_-10%_-10%_60%] rounded-full bg-[rgba(30,58,138,0.1)] blur-[75px]"
        aria-hidden
      />

      <div className="relative flex w-full max-w-[448px] flex-col gap-[31.5px]">
        <header className="flex flex-col gap-2">
          <h1 className="font-manrope text-center text-[30px] font-extrabold leading-9 tracking-[3px] text-presencia-navy">
            PRESENCIA
          </h1>
          <p className="text-center text-base font-medium leading-6 tracking-[-0.4px] text-presencia-muted">
            The digital foyer for professional presence
          </p>
        </header>

        <section
          className="relative w-full rounded-[32px] border border-white/20 bg-white/70 px-[33px] pb-[33px] pt-[49.5px] shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.08)] backdrop-blur-[8px]"
          aria-labelledby="login-heading"
        >
          <div
            className="pointer-events-none absolute inset-x-[-1px] bottom-[-1px] top-[15.5px] rounded-[32px] shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.08)]"
            aria-hidden
          />

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2
                id="login-heading"
                className="font-manrope text-2xl font-bold leading-8 text-[#191c1e]"
              >
                Welcome Back
              </h2>
              <p className="text-sm font-normal leading-5 text-presencia-body">
                Please enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="flex flex-col gap-6" action={loginAction}>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="pl-1 text-sm font-bold uppercase tracking-[0.7px] text-presencia-navy"
                >
                  Work email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-4 text-presencia-placeholder">
                    <MailIcon className="size-4 shrink-0" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="presencia@ikwook.cd"
                    className="w-full rounded-md border-0 bg-presencia-input-bg py-[18px] pl-12 pr-4 text-base text-[#191c1e] placeholder:text-presencia-placeholder focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-presencia-navy/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold uppercase tracking-[0.7px] text-presencia-navy"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-presencia-navy hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-4 text-presencia-placeholder">
                    <LockIcon className="h-[18px] w-3.5 shrink-0" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-md border-0 bg-presencia-input-bg py-[18px] pl-12 pr-4 text-base text-[#191c1e] placeholder:text-presencia-placeholder focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-presencia-navy/40"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 px-1">
                <input
                  name="remember"
                  type="checkbox"
                  className="size-4 shrink-0 rounded-sm border border-presencia-border accent-presencia-navy"
                />
                <span className="text-sm font-medium text-presencia-body">
                  Keep me logged in
                </span>
              </label>

              <button
                type="submit"
                className="font-manrope relative w-full rounded-md bg-[linear-gradient(167.74deg,rgb(0,35,111)_0%,rgb(30,58,138)_100%)] py-4 text-lg font-bold leading-7 text-white shadow-[0px_10px_15px_-3px_rgba(0,35,111,0.2),0px_4px_6px_-4px_rgba(0,35,111,0.2)] transition hover:opacity-[0.98]"
              >
                Sign In
              </button>
            </form>

            <div className="relative border-t border-[rgba(226,232,240,0.5)] pt-[33px]">
              <p className="pb-6 text-center text-xs font-bold uppercase tracking-[2.4px] text-presencia-placeholder">
                Or use biometrics
              </p>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="flex flex-col items-center rounded-[32px] p-4 transition hover:bg-black/[0.02]"
                  aria-label="Sign in with Face ID or fingerprint"
                >
                  <span className="flex size-16 items-center justify-center rounded-full border-2 border-[rgba(0,35,111,0.2)] p-0.5">
                    <FingerprintIcon className="text-presencia-navy" />
                  </span>
                  <span className="pt-3 text-center text-sm font-semibold text-presencia-body">
                    FaceID / Fingerprint
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-medium text-presencia-body">
          <span>New to the platform?</span>
          <Link
            href="/request-access"
            className="font-manrope font-bold text-presencia-navy hover:underline"
          >
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}
