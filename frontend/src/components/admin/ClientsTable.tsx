import { ClientStats } from "../../services/adminApi";

interface ClientsTableProps {
  clients: ClientStats[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No client data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Calls
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Optimizations
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage %
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.clientId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {client.clientId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.totalCalls.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.optimizations.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(parseFloat(client.percentage), 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{client.percentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
