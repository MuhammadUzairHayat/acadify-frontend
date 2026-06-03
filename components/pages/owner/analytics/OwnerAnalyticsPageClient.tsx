"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useBillingData } from "@/hooks/useOwner";

type Period = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  day: "Last 30 days",
  week: "Last 90 days",
  month: "Last 12 months",
  year: "Last 3 years",
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function OwnerAnalyticsPageClient() {
  const [period, setPeriod] = useState<Period>("month");
  const { billing, isLoading: billingLoading } = useBillingData();

  const hasAnalytics =
    (billing as { entitlements?: { advancedAnalytics?: boolean } } | null)
      ?.entitlements?.advancedAnalytics === true;

  const analyticsQuery = useQuery({
    queryKey: queryKeys.billing.analytics(period),
    queryFn: () => api.ownerPayments.getRevenueAnalytics(period),
    enabled: hasAnalytics,
    staleTime: STALE_TIMES.billing,
  });

  if (billingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!hasAnalytics) {
    return (
      <OwnerPageShell eyebrow="Insights" title="Analytics" subtitle="Pro plan required.">
        <Link href="/owner/billing" className="text-sm text-accent hover:underline">
          View plans →
        </Link>
      </OwnerPageShell>
    );
  }

  if (analyticsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (analyticsQuery.isError) {
    return (
      <OwnerPageShell eyebrow="Insights" title="Analytics">
        <p className="text-sm text-red-400">{(analyticsQuery.error as Error).message}</p>
      </OwnerPageShell>
    );
  }

  const data = analyticsQuery.data!;
  const { summary, chart, recentSales } = data;
  const maxGross = Math.max(...chart.map((c) => c.gross), 1);

  return (
    <OwnerPageShell
      eyebrow="Insights"
      title="Analytics"
      subtitle="Revenue & sales."
      contentClassName="max-w-5xl space-y-6"
      action={
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          aria-label="Analytics period"
          className="px-3 py-2 rounded-xl border border-border-subtle bg-surface text-text-primary text-sm"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
            <option key={key} value={key}>
              {PERIOD_LABELS[key]}
            </option>
          ))}
        </select>
      }
    >
      <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={70}>
        {[
          { label: "Gross", value: formatMoney(summary.totalGross) },
          { label: "Fees", value: formatMoney(summary.totalPlatformFees) },
          { label: "Net", value: formatMoney(summary.totalOwnerNet) },
          { label: "Sales", value: String(summary.totalSales) },
        ].map((stat, index) => (
          <RevealItem key={stat.label} index={index}>
            <Card padding="lg" className="border-border-subtle bg-surface/40">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">{stat.label}</p>
              <p className="text-xl font-bold text-text-primary mt-2 tabular-nums">{stat.value}</p>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>

      <RevealOnScroll>
        <Card padding="lg" className="border-border-subtle bg-surface/40">
          <h2 className="text-sm font-bold text-text-primary mb-4">Gross over time</h2>
        {chart.length === 0 ? (
          <p className="text-sm text-text-secondary">No sales in this period.</p>
        ) : (
          <ul className="space-y-2">
            {chart.map((row) => (
              <li key={row.period} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-text-tertiary">{row.period}</span>
                <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(row.gross / maxGross) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-text-primary">
                  {formatMoney(row.gross)}
                </span>
                <span className="w-12 text-right text-text-tertiary">
                  {row.sales}
                </span>
              </li>
            ))}
          </ul>
        )}
        </Card>
      </RevealOnScroll>

      <RevealOnScroll delay={80}>
        <Card padding="none" className="border-border-subtle bg-surface/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-text-primary">Recent sales</h2>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-text-secondary">Date</th>
                <th className="px-6 py-3 text-right text-text-secondary">Gross</th>
                <th className="px-6 py-3 text-right text-text-secondary">Fee</th>
                <th className="px-6 py-3 text-right text-text-secondary">Net</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, index) => (
                <tr key={`${sale.date}-${index}`} className="border-t border-border">
                  <td className="px-6 py-3 text-text-primary">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">{formatMoney(sale.gross)}</td>
                  <td className="px-6 py-3 text-right text-text-secondary">
                    {formatMoney(sale.platformFee)}
                  </td>
                  <td className="px-6 py-3 text-right font-medium">
                    {formatMoney(sale.ownerNet)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </Card>
      </RevealOnScroll>
    </OwnerPageShell>
  );
}
