import { useState } from "react";
import { HagenLogisticsModule } from "./components/HagenLogisticsModule";
import type { LogisticsMode, Task } from "./types";
import { env, isDevelopment } from "./config/env";

export function App() {
  const [mode, setMode] = useState<LogisticsMode>("service");

  const handleTaskClick = (task: Task) => {
    if (isDevelopment) {
      console.log("Task clicked:", task);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ─── Header ───────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-hagen-700">
            Hagen Logistics
          </h1>

          {/* Mode switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode("service")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === "service"
                  ? "bg-white text-hagen-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Service
            </button>
            <button
              onClick={() => setMode("delivery")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === "delivery"
                  ? "bg-white text-hagen-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Livraison
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main content ─────────────────────────── */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto h-full">
          <HagenLogisticsModule
            mode={mode}
            apiKey={env.VITE_API_KEY}
            onTaskClick={handleTaskClick}
          />
        </div>
      </main>
    </div>
  );
}
