import type { Task, ShipmentData } from "../../types";

interface DeliveryCardListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: string | null;
}

export function DeliveryCardList({ tasks, onTaskClick, selectedTaskId }: DeliveryCardListProps) {
  const sorted = [...tasks].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-2">
      {sorted.map((task) => {
        const data = task.data as ShipmentData;
        const isSelected = selectedTaskId === task.id;

        return (
          <div
            key={task.id}
            className={`task-item p-4 rounded-lg border cursor-pointer transition-colors ${
              isSelected ? "border-hagen-400 bg-blue-50" : "border-gray-200 hover:border-hagen-300"
            }`}
            onClick={() => onTaskClick?.(task)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Colis #{task.sort_order || "?"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full badge-${task.status}`}>
                {task.status}
              </span>
            </div>

            {/* Flow: Pickup → Delivery */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex-1 p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-700 mb-0.5">Pickup</div>
                <div>
                  {data.pickup_lat?.toFixed(4)}, {data.pickup_lng?.toFixed(4)}
                </div>
              </div>

              {/* Arrow */}
              <svg className="w-5 h-5 text-hagen-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>

              <div className="flex-1 p-2 bg-blue-50 rounded">
                <div className="font-medium text-hagen-700 mb-0.5">Livraison</div>
                <div>
                  {data.delivery_lat?.toFixed(4)}, {data.delivery_lng?.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Weight info */}
            {data.weight && (
              <div className="mt-2 text-xs text-gray-500">Poids : {data.weight} kg</div>
            )}

            {/* Mock scan / signature buttons */}
            {task.status === "in_progress" && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 text-xs py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  Scanner
                </button>
                <button className="flex-1 text-xs py-1.5 rounded bg-hagen-100 hover:bg-hagen-200 text-hagen-700 transition-colors">
                  Signature
                </button>
              </div>
            )}
          </div>
        );
      })}

      {tasks.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Aucune livraison</p>
      )}
    </div>
  );
}
