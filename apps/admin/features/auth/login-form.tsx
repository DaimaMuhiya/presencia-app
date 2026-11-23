"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bffFetch,
  BffRequestError,
  type LoginChallengeResponse,
} from "@/lib/auth/bff-client";
import { saveOtpChallenge } from "@/lib/auth/challenge-storage";
import { AUTH_VERIFY_OTP_PATH } from "@/lib/auth/auth-routes";
import { resolveSafeNextParam } from "@/lib/auth/safe-next";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forbidden = searchParams.get("error") === "forbidden";
  const safeNext = resolveSafeNextParam(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await bffFetch<LoginChallengeResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password, remember },
        skipRefreshRetry: true,
      });

      const challenge = res.data;
      if (!challenge?.challenge_id) {
        setError("Réponse de connexion incomplète.");
        return;
      }

      saveOtpChallenge({
        challenge_id: challenge.challenge_id,
        remember,
        next: safeNext,
      });

      router.push(AUTH_VERIFY_OTP_PATH);
    } catch (err) {
      if (err instanceof BffRequestError) {
        setError(err.message);
      } else {
        setError("Impossible de se connecter pour le moment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Bon retour"
      description="Identifiez-vous pour accéder à la console d'administration."
    >
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        {forbidden ? (
          <p
            className="rounded-md border border-warning-muted bg-warning-muted/60 px-3 py-2 text-sm text-text-primary"
            role="status"
          >
            Ce compte ne peut pas accéder à la console d&apos;administration.
          </p>
        ) : null}

        {error ? (
          <p
            className="rounded-md border border-danger-muted bg-danger-muted/40 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-bold uppercase tracking-wide text-primary"
          >
            E-mail professionnel
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-bold uppercase tracking-wide text-primary"
          >
            Mot de passe
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-medium text-text-secondary">
            Rester connecté
          </span>
        </label>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[linear-gradient(167.74deg,#00236f_0%,#1e3a8a_100%)] py-3 text-base font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}