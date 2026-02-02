import type { Task, ServiceData } from "../../types";

interface ServiceTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function formatTime(isoString?: string): string {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ServiceTimeline({ tasks, onTaskClick }: ServiceTimelineProps) {
  const sorted = [...tasks].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-1">
      {sorted.map((task, index) => {
        const data = task.data as ServiceData;
        const durationMin = Math.round((data.duration || 0) / 60);

        return (
          <div
            key={task.id}
            className="task-item flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-hagen-300 cursor-pointer transition-colors"
            onClick={() => onTaskClick?.(task)}
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  task.status === "completed"
                    ? "bg-green-500"
                    : task.status === "in_progress"
                    ? "bg-amber-500"
                    : "bg-hagen-400"
                }`}
              />
              {index < sorted.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Intervention #{task.sort_order || index + 1}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full badge-${task.status}`}>
                  {task.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span>{formatTime(task.scheduled_at)}</span>
                <span className="mx-1">&middot;</span>
                <span>{durationMin} min</span>
              </div>
              {data.description && (
                <p className="text-xs text-gray-600 mt-1 truncate">{data.description}</p>
              )}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Aucune intervention</p>
      )}
    </div>
  );
}
