import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const trendColors = {
  up: "text-green-700",
  down: "text-red-600",
  neutral: "text-blue-700",
};

export interface InvoiceStat {
  label: string;
  value: string;
  percent: number;
  trend: "up" | "down" | "neutral";
}

export function InvoiceStats({ stats }: { stats: InvoiceStat[] }) {
  return (
    <div className="w-full bg-white border rounded-xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 justify-between">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center sm:items-start px-2 min-w-[120px]">
          <div className="flex items-center gap-1 mb-1">
            {stat.trend === "up" && <ArrowUpRight className={`w-4 h-4 ${trendColors.up}`} />}
            {stat.trend === "down" && <ArrowDownRight className={`w-4 h-4 ${trendColors.down}`} />}
            <span className={`text-xs font-semibold ${trendColors[stat.trend]}`}>
              {stat.trend === "neutral" ? "" : (stat.trend === "up" ? "+" : "-")}
              {stat.percent}%
            </span>
            <span className="text-xs text-gray-400">/month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
} 