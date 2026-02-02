import { useState, useCallback } from "react";
import type { OptimizationResult } from "../types";
import { optimize } from "../sdk/api";

export function useOptimize(apiKey: string) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await optimize(apiKey);
      setResult(res);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Optimization failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return { result, loading, error, run };
}
