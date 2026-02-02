import type { Task, StaffMember, OptimizationResult } from "../types";

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL || "/api";
}

function headers(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ─── Tasks ────────────────────────────────────────────

export async function fetchTasks(
  apiKey: string,
  params?: { status?: string; type?: string }
): Promise<{ items: Task[]; totalItems: number }> {
  const url = new URL(`${getBaseUrl()}/api/tasks`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.type) url.searchParams.set("type", params.type);

  const res = await fetch(url.toString(), { headers: headers(apiKey) });
  return handleResponse(res);
}

export async function createTask(
  apiKey: string,
  task: Partial<Task>
): Promise<Task> {
  const res = await fetch(`${getBaseUrl()}/api/tasks`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

export async function updateTask(
  apiKey: string,
  taskId: string,
  data: Partial<Task>
): Promise<Task> {
  const res = await fetch(`${getBaseUrl()}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: headers(apiKey),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── Staff ────────────────────────────────────────────

export async function fetchStaff(apiKey: string): Promise<{ items: StaffMember[] }> {
  const res = await fetch(`${getBaseUrl()}/api/staff`, {
    headers: headers(apiKey),
  });
  return handleResponse(res);
}

// ─── Optimization ─────────────────────────────────────

export async function optimize(apiKey: string): Promise<OptimizationResult> {
  const res = await fetch(`${getBaseUrl()}/api/optimize`, {
    method: "POST",
    headers: headers(apiKey),
  });
  return handleResponse(res);
}
