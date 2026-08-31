import { AlertTriangle, CheckCircle2, CircleSlash2, Info } from "lucide-react";
import type { DiagnosticStatus } from "../types";

const icons = {
  passed: CheckCircle2,
  review: AlertTriangle,
  blocked: CircleSlash2,
  info: Info,
};

interface StatusMarkProps {
  status: DiagnosticStatus;
  label: string;
  compact?: boolean;
}

export function StatusMark({ status, label, compact = false }: StatusMarkProps) {
  const Icon = icons[status];
  return (
    <span className={`status-mark status-${status}${compact ? " status-compact" : ""}`}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
