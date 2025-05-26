import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";

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
    <div className="w-full bg-gray-50 border border-gray-200  p-0 mb-8 flex flex-col justify-between overflow-hidden ">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-800 mr-2">
            <Info className="h-5 w-5" />
          </span>
          <span className="text-xl font-normal text-gray-900">Invoices Overview</span>
        </div>
        <div className="text-xs text-gray-400 font-normal">
          {lastUpdated ? `Last updated ${lastUpdated}` : ""}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 px-2 md:px-0 py-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center justify-center px-6 py-5 min-w-[160px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                {stat.label}
                {stat.trend === 'up' && <span className="ml-2 px-2 py-0.5 text-xs bg-green-50 rounded-full text-green-800 font-normal align-top">{stat.trend}</span>}
              </span>
              {typeof stat.count === 'number' && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-50 rounded-full text-green-800 font-normal align-top">{stat.count}</span>
              )}
            </div>
            <div className="text-2xl font-normal text-gray-900 tracking-tight mb-0">{stat.value}</div>
            {stat.subLabel && (
              <div className="text-xs text-gray-400 mt-1">{stat.subLabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>
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