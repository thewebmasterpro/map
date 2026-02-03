import { UsageData } from "../../services/adminApi";

interface UsageChartProps {
  data: UsageData[];
}

export function UsageChart({ data }: UsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No usage data available</p>
      </div>
    );
  }

  // Calculate dimensions
  const width = 900;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for scaling
  const maxCalls = Math.max(...data.map((d) => d.calls), 1);

  // Calculate bar width
  const barWidth = chartWidth / data.length;
  const barSpacing = 2;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const value = Math.round((maxCalls * percent) / 100);
          const y = height - padding.bottom - (chartHeight * percent) / 100;

          return (
            <g key={percent}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {value}
              </text>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="4"
              />
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.calls / maxCalls) * chartHeight;
          const x = padding.left + index * barWidth + barSpacing;
          const y = height - padding.bottom - barHeight;

          // Format date for display (show every 5th day)
          const showLabel = index % 5 === 0 || index === data.length - 1;
          const dateLabel = new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <g key={item.date}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth - barSpacing * 2}
                height={barHeight}
                fill="#3b82f6"
                className="hover:fill-blue-700 transition-colors"
              >
                <title>
                  {dateLabel}: {item.calls} calls
                </title>
              </rect>

              {/* X-axis label */}
              {showLabel && (
                <text
                  x={x + (barWidth - barSpacing * 2) / 2}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform={`rotate(-45, ${x + (barWidth - barSpacing * 2) / 2}, ${
                    height - padding.bottom + 20
                  })`}
                >
                  {dateLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Chart title / labels */}
        <text
          x={width / 2}
          y={padding.top - 5}
          textAnchor="middle"
          className="text-sm font-medium fill-gray-700"
        >
          API Calls per Day
        </text>

        <text
          x={padding.left - 45}
          y={height / 2}
          textAnchor="middle"
          className="text-sm fill-gray-600"
          transform={`rotate(-90, ${padding.left - 45}, ${height / 2})`}
        >
          Number of Calls
        </text>
      </svg>

      {/* Legend */}
      <div className="flex justify-center mt-4 gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>API Calls</span>
        </div>
        <div>
          Total: <span className="font-bold">{data.reduce((sum, d) => sum + d.calls, 0)}</span>
        </div>
        <div>
          Max/Day: <span className="font-bold">{maxCalls}</span>
        </div>
        <div>
          Avg/Day:{" "}
          <span className="font-bold">
            {Math.round(data.reduce((sum, d) => sum + d.calls, 0) / data.length)}
          </span>
        </div>
      </div>
    </div>
  );
}
