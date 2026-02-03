import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, SummaryStats, ClientStats, ActivityLog, UsageData } from "../services/adminApi";
import { StatsCard } from "../components/admin/StatsCard";
import { ClientsTable } from "../components/admin/ClientsTable";
import { ActivityTable } from "../components/admin/ActivityTable";
import { UsageChart } from "../components/admin/UsageChart";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const [summaryData, clientsData, activityData, usageData] = await Promise.all([
        adminApi.getSummary(),
        adminApi.getClients(),
        adminApi.getActivity(50),
        adminApi.getUsageOverTime(),
      ]);

      setSummary(summaryData);
      setClients(clientsData);
      setActivity(activityData);
      setUsage(usageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);

      // Redirect to login if session expired
      if (errorMessage.includes("Session expired") || errorMessage.includes("authenticated")) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
  };

  const handleLogout = () => {
    adminApi.logout();
    navigate("/admin/login");
  };

  useEffect(() => {
    // Check authentication
    if (!adminApi.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => loadData()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Hagen Map Service - Monitoring</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total API Calls"
              value={summary.totalApiCalls.toLocaleString()}
              icon="📊"
              color="blue"
            />
            <StatsCard
              title="Optimizations"
              value={summary.totalOptimizations.toLocaleString()}
              subtitle={`${summary.successRate}% success rate`}
              icon="🎯"
              color="green"
            />
            <StatsCard
              title="Active Clients"
              value={summary.activeClients.toString()}
              icon="👥"
              color="purple"
            />
            <StatsCard
              title="Avg Response Time"
              value={`${summary.averageResponseTime}ms`}
              subtitle={`Processing: ${summary.averageProcessingTime}ms`}
              icon="⚡"
              color="yellow"
            />
          </div>
        )}

        {/* Usage Chart */}
        {usage.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">API Usage (Last 30 Days)</h2>
            <UsageChart data={usage} />
          </div>
        )}

        {/* Clients Table */}
        {clients.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Client Usage</h2>
            <ClientsTable clients={clients} />
          </div>
        )}

        {/* Activity Logs */}
        {activity.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Recent Activity (Errors)</h2>
            <ActivityTable activity={activity} />
          </div>
        )}

        {activity.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>No recent activity to display</p>
          </div>
        )}
      </main>
    </div>
  );
}
