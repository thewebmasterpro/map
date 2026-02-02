import { useTasks } from "../hooks/useTasks";
import { useStaff } from "../hooks/useStaff";
import { useOptimize } from "../hooks/useOptimize";
import { LogisticsMap } from "./Map/LogisticsMap";
import { ServiceTimeline } from "./Timeline/ServiceTimeline";
import { DeliveryCardList } from "./DeliveryCards/DeliveryCardList";
import { OptimizeButton } from "./Shared/OptimizeButton";
import type { HagenLogisticsModuleProps } from "../types";

/**
 * <HagenLogisticsModule />
 *
 * Composant principal "Caméléon" qui s'adapte au mode :
 *  - mode="service"  → Timeline + marqueurs simples
 *  - mode="delivery" → Cartes de colis + flux A→B
 */
export function HagenLogisticsModule({
  mode,
  apiKey,
  className = "",
  onOptimized,
  onTaskClick,
}: HagenLogisticsModuleProps) {
  const taskType = mode === "service" ? "service" : "shipment";

  const { tasks, loading: tasksLoading, error: tasksError } = useTasks({ apiKey, type: taskType });
  const { staff } = useStaff(apiKey);
  const { loading: optimizing, run: runOptimize } = useOptimize(apiKey);

  const handleOptimize = async () => {
    try {
      const result = await runOptimize();
      if (result) onOptimized?.(result);
    } catch {
      // Error handled inside hook
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 h-full ${className}`}>
      {/* ─── Sidebar: Task list ─────────────────────── */}
      <div className="w-full lg:w-96 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "service" ? "Interventions" : "Livraisons"}
          </h2>
          <span className="text-xs text-gray-400">
            {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
          </span>
        </div>

        <OptimizeButton
          loading={optimizing}
          onClick={handleOptimize}
          disabled={tasks.length === 0}
        />

        <div className="flex-1 overflow-y-auto pr-1">
          {tasksError && (
            <p className="text-sm text-red-500 p-2">{tasksError}</p>
          )}

          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-hagen-400 border-t-transparent rounded-full" />
            </div>
          ) : mode === "service" ? (
            <ServiceTimeline tasks={tasks} onTaskClick={onTaskClick} />
          ) : (
            <DeliveryCardList tasks={tasks} onTaskClick={onTaskClick} />
          )}
        </div>
      </div>

      {/* ─── Map ────────────────────────────────────── */}
      <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <LogisticsMap
          mode={mode}
          tasks={tasks}
          staff={staff}
          onTaskClick={onTaskClick}
        />
      </div>
    </div>
  );
}
