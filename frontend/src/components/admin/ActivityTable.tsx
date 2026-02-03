import { ActivityLog } from "../../services/adminApi";

interface ActivityTableProps {
  activity: ActivityLog[];
}

export function ActivityTable({ activity }: ActivityTableProps) {
  if (activity.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent activity</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getErrorBadge = (type: string) => {
    const classes =
      type === "server_error"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
        {type.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Endpoint
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activity.map((log, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(log.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getErrorBadge(log.type)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {log.clientId || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <span className="font-mono text-xs">
                  {log.details.method} {log.details.endpoint}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    log.details.statusCode && log.details.statusCode >= 500
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {log.details.statusCode || "N/A"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
