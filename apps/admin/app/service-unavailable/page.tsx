import { AuthLayoutShell } from "@/components/auth/auth-layout-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { ServiceUnavailableActions } from "@/features/auth/service-unavailable-actions";

export default function ServiceUnavailablePage() {
  return (
    <AuthLayoutShell>
      <AuthCard
        title="Service temporairement indisponible"
        description="La vérification de session est impossible pour le moment. Votre session n’a pas été supprimée."
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            Réessayez dans quelques instants. Si le problème persiste, contactez
            l’équipe technique.
          </p>
          <ServiceUnavailableActions />
        </div>
      </AuthCard>
    </AuthLayoutShell>
  );
}