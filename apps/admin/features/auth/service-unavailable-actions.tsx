"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTH_LOGIN_PATH } from "@/lib/auth/auth-routes";

export function ServiceUnavailableActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="primary"
        className="flex-1"
        onClick={() => window.location.reload()}
      >
        Réessayer
      </Button>
      <Link href={AUTH_LOGIN_PATH} className="flex-1">
        <Button type="button" variant="secondary" className="w-full">
          Retour à la connexion
        </Button>
      </Link>
    </div>
  );
}