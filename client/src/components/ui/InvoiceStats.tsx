import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface InvoiceStat {
  label: string;
  value: string;
  percent: number;
  trend: "up" | "down" | "neutral";
  count?: number; // Optional count for badge
  subLabel?: string; // Optional sub-label (e.g., "this month")
}

export function InvoiceStats({ stats, lastUpdated }: { stats: InvoiceStat[]; lastUpdated?: string }) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-0 mb-8 flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 px-2 md:px-0 ">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-start justify-center px-6 py-4 min-w-[200px]"
          >
            <div className="text-sm font-normal text-gray-800 mb-2">{stat.label}</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-green-800 leading-tight">{stat.value}</span>
              {stat.subLabel && (
                <span className="text-sm text-gray-400 font-normal ml-1">from {stat.subLabel}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <PercentPill percent={stat.percent} trend={stat.trend} />
              {typeof stat.count === 'number' && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full text-gray-700 font-normal align-top">Total Invoices: {stat.count}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PercentPill({ percent, trend }: { percent: number; trend: "up" | "down" | "neutral" }) {
  let color = "bg-gray-100 text-gray-600";
  let icon = null;
  if (trend === "up") {
    color = "bg-green-100 text-green-700";
    icon = <ArrowUpRight className="w-4 h-4 inline-block mr-0.5" />;
  } else if (trend === "down") {
    color = "bg-red-100 text-red-700";
    icon = <ArrowDownRight className="w-4 h-4 inline-block mr-0.5" />;
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${color}`}>
      {icon}
      {percent > 0 ? `+${percent}%` : `${percent}%`}
    </span>
  );
}

// Brandfetch logo hook
export function useBrandLogo(domain: string, fallback?: string) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!domain) return;
    const apiKey = "YOUR_BRANDFETCH_API_KEY"; // Replace with your key or use env
    fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
      .then(res => res.json())
      .then(data => {
        const logo = data.logos?.[0]?.formats?.find((f: any) => f.format === 'svg' || f.format === 'png');
        setLogoUrl(logo?.src || fallback || null);
      })
      .catch(() => setLogoUrl(fallback || null));
  }, [domain, fallback]);
  return logoUrl;
} 