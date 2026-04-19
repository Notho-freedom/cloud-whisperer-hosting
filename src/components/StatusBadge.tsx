import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "info" }> = {
  active: { label: "Actif", variant: "success" },
  ready: { label: "Ready", variant: "success" },
  operational: { label: "Opérationnel", variant: "success" },
  paid: { label: "Payée", variant: "success" },
  resolved: { label: "Résolu", variant: "success" },
  closed: { label: "Fermé", variant: "secondary" },

  expiring: { label: "Expire bientôt", variant: "warning" },
  pending: { label: "En attente", variant: "warning" },
  building: { label: "Build", variant: "warning" },
  queued: { label: "En file", variant: "warning" },
  degraded: { label: "Dégradé", variant: "warning" },
  open: { label: "Ouvert", variant: "warning" },
  monitoring: { label: "Monitoring", variant: "warning" },

  expired: { label: "Expiré", variant: "destructive" },
  error: { label: "Erreur", variant: "destructive" },
  failed: { label: "Échec", variant: "destructive" },
  suspended: { label: "Suspendu", variant: "destructive" },
  urgent: { label: "Urgent", variant: "destructive" },
  high: { label: "Haute", variant: "destructive" },

  transferring: { label: "Transfert", variant: "info" },
  canceled: { label: "Annulé", variant: "secondary" },
  invited: { label: "Invité", variant: "info" },
  void: { label: "Annulé", variant: "secondary" },
  scheduled: { label: "Planifié", variant: "info" },
  sent: { label: "Envoyé", variant: "secondary" },
  normal: { label: "Normale", variant: "secondary" },
  low: { label: "Basse", variant: "secondary" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = STATUS_MAP[status] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge variant={entry.variant} className={cn("gap-1.5 font-medium", className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          entry.variant === "success" && "bg-success",
          entry.variant === "warning" && "bg-warning",
          entry.variant === "destructive" && "bg-destructive",
          entry.variant === "info" && "bg-info",
          entry.variant === "secondary" && "bg-muted-foreground",
          entry.variant === "default" && "bg-primary-foreground",
        )}
      />
      {entry.label}
    </Badge>
  );
}
