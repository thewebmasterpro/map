import { useState, useEffect, useCallback } from "react";
import type { Task } from "../types";
import { fetchTasks } from "../sdk/api";
import { getPocketBaseClient } from "../sdk/pocketbaseClient";

interface UseTasksOptions {
  apiKey: string;
  type?: string;
  status?: string;
}

export function useTasks({ apiKey, type, status }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchTasks(apiKey, { type, status });
      setTasks(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [apiKey, type, status]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Real-time subscription via PocketBase
  useEffect(() => {
    const pb = getPocketBaseClient();

    pb.collection("tasks").subscribe("*", (e) => {
      setTasks((prev) => {
        if (e.action === "create") {
          return [...prev, e.record as unknown as Task];
        }
        if (e.action === "update") {
          return prev.map((t) => (t.id === e.record.id ? (e.record as unknown as Task) : t));
        }
        if (e.action === "delete") {
          return prev.filter((t) => t.id !== e.record.id);
        }
        return prev;
      });
    });

    return () => {
      pb.collection("tasks").unsubscribe("*");
    };
  }, []);

  return { tasks, loading, error, reload: load };
}
