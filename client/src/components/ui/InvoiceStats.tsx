import React from "react";

export interface InvoiceStat {
  label: string;
  value: string;
  percent: number;
  trend: "up" | "down" | "neutral";
}

export function InvoiceStats({ stats }: { stats: InvoiceStat[] }) {
  // Remove the last stat (assumed to be 'Overdue')
  const displayStats = stats.slice(0, 3);
  return (
    <div className="w-full bg-transparent border-0 p-0 mb-6 flex flex-row divide-x divide-gray-200 overflow-hidden rounded-none">
      {displayStats.map((stat, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col justify-between px-8 py-6 min-w-[180px]"
        >
          <div className="flex items-start justify-between mb-6">
            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            <span
              className={`text-xs font-normal ${
                stat.percent > 0
                  ? "text-green-600"
                  : stat.percent < 0
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {stat.percent > 0 ? "+" : stat.percent < 0 ? "-" : ""}
              {Math.abs(stat.percent).toFixed(2)}%
            </span>
          </div>
          <div className="text-3xl font-normal text-black tracking-tight">{stat.value}</div>
        </div>
      ))}
    </div>
  );
} 