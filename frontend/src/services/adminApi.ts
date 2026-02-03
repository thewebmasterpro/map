const API_URL = import.meta.env.VITE_API_URL;

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  expiresIn: number;
}

export interface SummaryStats {
  totalApiCalls: number;
  totalOptimizations: number;
  successRate: string;
  averageProcessingTime: number;
  averageResponseTime: number;
  activeClients: number;
  totalErrors: number;
  errorRate: string;
}

export interface ClientStats {
  clientId: string;
  totalCalls: number;
  optimizations: number;
  percentage: string;
}

export interface ActivityLog {
  type: string;
  details: {
    statusCode?: number;
    endpoint?: string;
    method?: string;
  };
  clientId: string | null;
  timestamp: string;
}

export interface UsageData {
  date: string;
  calls: number;
}

/**
 * Admin API service for authentication and data fetching
 */
class AdminApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("admin_token");
  }

  /**
   * Login with admin credentials
   */
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data: AdminLoginResponse = await response.json();

    // Store token
    this.token = data.token;
    localStorage.setItem("admin_token", data.token);

    return data;
  }

  /**
   * Logout - clear token
   */
  logout() {
    this.token = null;
    localStorage.removeItem("admin_token");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    if (!this.token) {
      throw new Error("Not authenticated");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<SummaryStats> {
    const response = await fetch(`${API_URL}/admin/summary`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch summary");
    }

    return response.json();
  }

  /**
   * Get client statistics
   */
  async getClients(): Promise<ClientStats[]> {
    const response = await fetch(`${API_URL}/admin/clients`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch clients");
    }

    const data = await response.json();
    return data.clients;
  }

  /**
   * Get activity logs
   */
  async getActivity(limit = 50): Promise<ActivityLog[]> {
    const response = await fetch(`${API_URL}/admin/activity?limit=${limit}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch activity");
    }

    const data = await response.json();
    return data.activity;
  }

  /**
   * Get usage over time
   */
  async getUsageOverTime(): Promise<UsageData[]> {
    const response = await fetch(`${API_URL}/admin/usage-over-time`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch usage data");
    }

    const data = await response.json();
    return data.usage;
  }

  /**
   * Get all statistics (full data)
   */
  async getAllStats(): Promise<any> {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch statistics");
    }

    return response.json();
  }

  /**
   * Reset all statistics
   */
  async resetStats(): Promise<void> {
    const response = await fetch(`${API_URL}/admin/reset-stats`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error("Session expired");
      }
      throw new Error("Failed to reset statistics");
    }
  }
}

export const adminApi = new AdminApiService();
