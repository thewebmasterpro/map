// ─── Task Types ───────────────────────────────────────

export type TaskType = "service" | "shipment";
export type TaskStatus = "pending" | "optimized" | "in_progress" | "completed";

export interface ServiceData {
  location: { lat: number; lng: number };
  duration: number; // seconds
  description?: string;
  skills?: number[];
}

export interface ShipmentData {
  pickup_lat: number;
  pickup_lng: number;
  delivery_lat: number;
  delivery_lng: number;
  weight?: number;
  pickup_duration?: number;
  delivery_duration?: number;
  description?: string;
  skills?: number[];
}

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  client_id: string;
  staff_id?: string;
  data: ServiceData | ShipmentData;
  sort_order: number;
  scheduled_at?: string;
  completed_at?: string;
  created: string;
  updated: string;
}

// ─── Staff Types ──────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  skills: number[];
  capacity: { weight?: number; volume?: number };
  start_location: { lat: number; lng: number };
  current_location?: { lat: number; lng: number };
  is_available: boolean;
}

// ─── Client Types ─────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  api_key: string;
  allowed_origins: string[];
  is_active: boolean;
}

// ─── Optimization Types ───────────────────────────────

export interface OptimizationResult {
  summary: {
    cost: number;
    routes: number;
    unassigned: number;
    delivery: number[];
    amount: number[];
    duration: number;
    distance: number;
  };
  unassigned: Array<{ id: number; description: string }>;
  routes: Array<{
    taskId: string;
    staffId: string;
    sortOrder: number;
    arrival: number;
    duration: number;
  }>;
}

// ─── Component Props ──────────────────────────────────

export type LogisticsMode = "service" | "delivery";

export interface HagenLogisticsModuleProps {
  mode: LogisticsMode;
  apiKey: string;
  apiUrl?: string;
  pocketbaseUrl?: string;
  className?: string;
  onOptimized?: (result: OptimizationResult) => void;
  onTaskClick?: (task: Task) => void;
}
