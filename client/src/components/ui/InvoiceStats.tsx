import React from "react";

export interface InvoiceStat {
  label: string;
  value: string;
  percent: number;
  trend: "up" | "down" | "neutral";
  count?: number; // Optional count for badge
}

export function InvoiceStats({ stats }: { stats: InvoiceStat[] }) {
  return (
    <div className="w-full bg-transparent border-0 p-0 mb-6 flex flex-row divide-x divide-gray-200 overflow-hidden rounded-none border-b border-t border-gray-200 pb-4 pt-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col justify-between px-6 py-6 min-w-[200px]"
        >
          <div className="flex items-start justify-between mb-6">
            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            {typeof stat.count === 'number' && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 font-semibold align-top">{stat.count}</span>
            )}
          </div>
          <div className="text-2xl font-normal text-black tracking-tight">{stat.value}</div>
        </div>
      ))}
    </div>
  );
} 