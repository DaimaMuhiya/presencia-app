import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PlaceholderPageProps = {
  moduleName: string;
  description: string;
};

export function PlaceholderPage({
  moduleName,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <Badge variant="outline" className="mb-4">
          Phase ultérieure
        </Badge>
        <h2 className="text-xl font-bold text-text-primary">{moduleName}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
        <p className="mt-4 text-xs text-text-secondary">
          Cet écran est un emplacement de route fonctionnel. Le contenu métier
          sera développé dans une prochaine phase.
        </p>
      </Card>
    </div>
  );
}
