"use client";

import { useEffect, useState, startTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bffFetch,
  BffRequestError,
  type VerifyOtpResponse,
} from "@/lib/auth/bff-client";
import {
  clearOtpChallenge,
  readOtpChallenge,
  type OtpChallengeState,
} from "@/lib/auth/challenge-storage";
import { AUTH_LOGIN_PATH } from "@/lib/auth/auth-routes";
import { resolveSafeNextParam } from "@/lib/auth/safe-next";
import {
  VERIFY_OTP_INITIAL_PHASE,
  canSubmitVerifyOtp,
  mapVerifyOtpError,
  phaseAfterChallengeLoad,
  shouldInvalidateOtpChallenge,
  type VerifyOtpPhase,
} from "@/lib/auth/verify-otp-errors";
import { useAuth } from "@/features/auth/auth-provider";

export function VerifyOtpForm() {
  const router = useRouter();
  const { setUserFromVerify } = useAuth();
  const [phase, setPhase] = useState<VerifyOtpPhase>(VERIFY_OTP_INITIAL_PHASE);
  const [challenge, setChallenge] = useState<OtpChallengeState | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = readOtpChallenge();
    startTransition(() => {
      setChallenge(stored);
      setPhase(phaseAfterChallengeLoad(stored));
    });
  }, []);

  const formDisabled = phase !== "ready" || isSubmitting;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !canSubmitVerifyOtp(
        phase,
        Boolean(challenge),
        isSubmitting,
        code.length
      )
    ) {
      return;
    }

    const activeChallenge = challenge;
    if (!activeChallenge) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await bffFetch<VerifyOtpResponse>("/api/auth/verify-otp", {
        method: "POST",
        body: {
          challenge_id: activeChallenge.challenge_id,
          code,
          remember: activeChallenge.remember,
        },
        skipRefreshRetry: true,
      });

      const user = res.data?.user;
      if (!user) {
        setError("Réponse de vérification incomplète.");
        return;
      }

      const destination = resolveSafeNextParam(activeChallenge.next);
      clearOtpChallenge();
      setUserFromVerify(user);
      router.replace(destination);
      router.refresh();
    } catch (err) {
      if (err instanceof BffRequestError) {
        setError(mapVerifyOtpError(err.status, err.message));
        if (shouldInvalidateOtpChallenge(err.status)) {
          clearOtpChallenge();
          setChallenge(null);
          setPhase("session-ended");
        }
      } else {
        setError("Impossible de vérifier le code pour le moment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const showActiveForm = phase === "ready" || phase === "session-ended";

  return (
    <AuthCard
      title="Vérification"
      description="Saisissez le code à six chiffres reçu par e-mail."
    >
      {phase === "loading" ? (
        <div
          className="flex flex-col items-center gap-3 py-6 text-sm text-text-secondary"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          Chargement de votre session de vérification…
        </div>
      ) : null}

      {phase === "missing" ? (
        <div className="flex flex-col gap-5">
          <p
            className="rounded-md border border-warning-muted bg-warning-muted/60 px-3 py-2 text-sm text-text-primary"
            role="status"
          >
            Aucune session de vérification en cours. Connectez-vous pour
            recevoir un nouveau code.
          </p>
          <Link
            href={AUTH_LOGIN_PATH}
            className="inline-flex w-full items-center justify-center rounded bg-[linear-gradient(167.74deg,#00236f_0%,#1e3a8a_100%)] py-3 text-base font-bold text-white"
          >
            Reprendre la connexion
          </Link>
        </div>
      ) : null}

      {showActiveForm ? (
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          {error ? (
            <p
              className="rounded-md border border-danger-muted bg-danger-muted/40 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {phase === "session-ended" ? (
            <p className="text-center text-sm text-text-secondary">
              <Link href={AUTH_LOGIN_PATH} className="font-semibold text-primary">
                Reprendre la connexion
              </Link>
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="otp"
              className="text-sm font-bold uppercase tracking-wide text-primary"
            >
              Code OTP
            </label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required={phase === "ready"}
              disabled={formDisabled}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="text-center text-lg tracking-[0.35em] disabled:opacity-60"
              placeholder="000000"
            />
          </div>

          <Button
            type="submit"
            disabled={
              !canSubmitVerifyOtp(
                phase,
                Boolean(challenge),
                isSubmitting,
                code.length
              )
            }
            className="w-full bg-[linear-gradient(167.74deg,#00236f_0%,#1e3a8a_100%)] py-3 text-base font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Vérification…
              </>
            ) : (
              "Valider le code"
            )}
          </Button>

          {phase === "ready" ? (
            <p className="text-center text-sm text-text-secondary">
              <Link
                href={AUTH_LOGIN_PATH}
                className="font-semibold text-primary"
              >
                Revenir à la connexion
              </Link>
            </p>
          ) : null}
        </form>
      ) : null}
    </AuthCard>
  );
}