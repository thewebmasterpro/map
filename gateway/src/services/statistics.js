import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * In-memory statistics store
 * For production, consider using Redis or a database
 */
class StatisticsService {
  constructor() {
    this.stats = {
      apiCalls: {
        total: 0,
        byClient: {}, // { client_id: count }
        byEndpoint: {}, // { endpoint: count }
        byDate: {}, // { 'YYYY-MM-DD': count }
      },
      optimizations: {
        total: 0,
        successful: 0,
        failed: 0,
        byClient: {}, // { client_id: count }
        averageProcessingTime: 0,
        processingTimes: [], // Keep last 100 for calculating average
      },
      errors: {
        total: 0,
        byType: {}, // { errorType: count }
        recent: [], // Last 50 errors with details
      },
      performance: {
        averageResponseTime: 0,
        responseTimes: [], // Last 100 response times
        slowestEndpoints: {}, // { endpoint: avgTime }
      },
      clients: {
        active: new Set(), // Active client IDs
        totalRequests: {},
      },
    };

    this.maxArraySize = 100; // Keep last 100 entries for averages
    this.maxRecentErrors = 50;

    // Load stats from file on startup if exists
    this.loadStats();
  }

  /**
   * Record an API call
   */
  recordApiCall(clientId, endpoint, method = "POST") {
    const today = new Date().toISOString().split("T")[0];

    this.stats.apiCalls.total++;
    this.stats.apiCalls.byClient[clientId] =
      (this.stats.apiCalls.byClient[clientId] || 0) + 1;

    const endpointKey = `${method} ${endpoint}`;
    this.stats.apiCalls.byEndpoint[endpointKey] =
      (this.stats.apiCalls.byEndpoint[endpointKey] || 0) + 1;

    this.stats.apiCalls.byDate[today] = (this.stats.apiCalls.byDate[today] || 0) + 1;

    this.stats.clients.active.add(clientId);
    this.stats.clients.totalRequests[clientId] =
      (this.stats.clients.totalRequests[clientId] || 0) + 1;
  }

  /**
   * Record an optimization request
   */
  recordOptimization(clientId, processingTime, success = true) {
    this.stats.optimizations.total++;

    if (success) {
      this.stats.optimizations.successful++;
    } else {
      this.stats.optimizations.failed++;
    }

    this.stats.optimizations.byClient[clientId] =
      (this.stats.optimizations.byClient[clientId] || 0) + 1;

    // Track processing time
    this.stats.optimizations.processingTimes.push(processingTime);
    if (this.stats.optimizations.processingTimes.length > this.maxArraySize) {
      this.stats.optimizations.processingTimes.shift();
    }

    // Calculate average
    this.stats.optimizations.averageProcessingTime = this._calculateAverage(
      this.stats.optimizations.processingTimes
    );
  }

  /**
   * Record an error
   */
  recordError(errorType, details, clientId = null) {
    this.stats.errors.total++;
    this.stats.errors.byType[errorType] = (this.stats.errors.byType[errorType] || 0) + 1;

    // Add to recent errors
    this.stats.errors.recent.unshift({
      type: errorType,
      details,
      clientId,
      timestamp: new Date().toISOString(),
    });

    // Keep only last N errors
    if (this.stats.errors.recent.length > this.maxRecentErrors) {
      this.stats.errors.recent = this.stats.errors.recent.slice(0, this.maxRecentErrors);
    }
  }

  /**
   * Record response time for performance tracking
   */
  recordResponseTime(endpoint, responseTime) {
    this.stats.performance.responseTimes.push(responseTime);
    if (this.stats.performance.responseTimes.length > this.maxArraySize) {
      this.stats.performance.responseTimes.shift();
    }

    // Calculate average response time
    this.stats.performance.averageResponseTime = this._calculateAverage(
      this.stats.performance.responseTimes
    );

    // Track slowest endpoints
    if (!this.stats.performance.slowestEndpoints[endpoint]) {
      this.stats.performance.slowestEndpoints[endpoint] = {
        total: 0,
        count: 0,
        avg: 0,
      };
    }

    const endpointStats = this.stats.performance.slowestEndpoints[endpoint];
    endpointStats.total += responseTime;
    endpointStats.count++;
    endpointStats.avg = endpointStats.total / endpointStats.count;
  }

  /**
   * Get all statistics
   */
  getStats() {
    return {
      ...this.stats,
      clients: {
        ...this.stats.clients,
        active: Array.from(this.stats.clients.active),
        count: this.stats.clients.active.size,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      totalApiCalls: this.stats.apiCalls.total,
      totalOptimizations: this.stats.optimizations.total,
      successRate:
        this.stats.optimizations.total > 0
          ? (
              (this.stats.optimizations.successful / this.stats.optimizations.total) *
              100
            ).toFixed(2)
          : 0,
      averageProcessingTime: Math.round(this.stats.optimizations.averageProcessingTime),
      averageResponseTime: Math.round(this.stats.performance.averageResponseTime),
      activeClients: this.stats.clients.active.size,
      totalErrors: this.stats.errors.total,
      errorRate:
        this.stats.apiCalls.total > 0
          ? ((this.stats.errors.total / this.stats.apiCalls.total) * 100).toFixed(2)
          : 0,
    };
  }

  /**
   * Get activity logs (recent API calls)
   */
  getActivityLogs(limit = 50) {
    // For now, return recent errors as activity
    // In production, you'd want to track all requests in a separate log
    return this.stats.errors.recent.slice(0, limit);
  }

  /**
   * Get client statistics
   */
  getClientStats() {
    const clients = Array.from(this.stats.clients.active).map((clientId) => ({
      clientId,
      totalCalls: this.stats.clients.totalRequests[clientId] || 0,
      optimizations: this.stats.optimizations.byClient[clientId] || 0,
      percentage:
        this.stats.apiCalls.total > 0
          ? (
              ((this.stats.clients.totalRequests[clientId] || 0) / this.stats.apiCalls.total) *
              100
            ).toFixed(2)
          : 0,
    }));

    // Sort by total calls descending
    return clients.sort((a, b) => b.totalCalls - a.totalCalls);
  }

  /**
   * Get usage over time (last 30 days)
   */
  getUsageOverTime() {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      last30Days.push({
        date: dateKey,
        calls: this.stats.apiCalls.byDate[dateKey] || 0,
      });
    }

    return last30Days;
  }

  /**
   * Reset statistics
   */
  reset() {
    this.stats = {
      apiCalls: { total: 0, byClient: {}, byEndpoint: {}, byDate: {} },
      optimizations: {
        total: 0,
        successful: 0,
        failed: 0,
        byClient: {},
        averageProcessingTime: 0,
        processingTimes: [],
      },
      errors: { total: 0, byType: {}, recent: [] },
      performance: {
        averageResponseTime: 0,
        responseTimes: [],
        slowestEndpoints: {},
      },
      clients: {
        active: new Set(),
        totalRequests: {},
      },
    };
  }

  /**
   * Save stats to file (for persistence across restarts)
   */
  async saveStats() {
    try {
      const statsToSave = {
        ...this.stats,
        clients: {
          ...this.stats.clients,
          active: Array.from(this.stats.clients.active),
        },
      };

      const statsPath = path.join(__dirname, "../../data/statistics.json");
      await fs.mkdir(path.dirname(statsPath), { recursive: true });
      await fs.writeFile(statsPath, JSON.stringify(statsToSave, null, 2));
    } catch (error) {
      console.error("Failed to save statistics:", error);
    }
  }

  /**
   * Load stats from file
   */
  async loadStats() {
    try {
      const statsPath = path.join(__dirname, "../../data/statistics.json");
      const data = await fs.readFile(statsPath, "utf-8");
      const loaded = JSON.parse(data);

      // Restore Set from array
      if (loaded.clients && loaded.clients.active) {
        loaded.clients.active = new Set(loaded.clients.active);
      }

      this.stats = loaded;
    } catch (error) {
      // File doesn't exist or error reading, start fresh
      console.log("Starting with fresh statistics");
    }
  }

  /**
   * Calculate average of array
   */
  _calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

// Singleton instance
const statisticsService = new StatisticsService();

// Save stats every 5 minutes
setInterval(() => {
  statisticsService.saveStats();
}, 5 * 60 * 1000);

export default statisticsService;
