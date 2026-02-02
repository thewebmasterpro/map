import { useState, useEffect, useCallback } from "react";
import type { StaffMember } from "../types";
import { fetchStaff } from "../sdk/api";
import { getPocketBaseClient } from "../sdk/pocketbaseClient";

export function useStaff(apiKey: string) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchStaff(apiKey);
      setStaff(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time location updates
  useEffect(() => {
    const pb = getPocketBaseClient();

    pb.collection("staff").subscribe("*", (e) => {
      if (e.action === "update") {
        setStaff((prev) =>
          prev.map((s) =>
            s.id === e.record.id ? (e.record as unknown as StaffMember) : s
          )
        );
      }
    });

    return () => {
      pb.collection("staff").unsubscribe("*");
    };
  }, []);

  return { staff, loading, error, reload: load };
}
