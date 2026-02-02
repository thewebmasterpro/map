import type { TaskStatus } from "../../types";

const labels: Record<TaskStatus, string> = {
  pending: "En attente",
  optimized: "Optimisé",
  in_progress: "En cours",
  completed: "Terminé",
};

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full badge-${status}`}>
      {labels[status]}
    </span>
  );
}
