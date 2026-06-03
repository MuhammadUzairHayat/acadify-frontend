"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import { useBillingData } from "@/hooks/useOwner";
import {
  listEnabledFeatures,
  type PlanFeatureFlags,
} from "@/lib/plan-features";

type BillingData = {
  currentPlan: { tier: string; name: string; platformFeeBps: number } | null;
  entitlements?: PlanFeatureFlags;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    gracePeriodEndsAt?: string | null;
  } | null;
  usage: {
    courseCount: number;
    storageBytesUsed: string;
    storageBytesLimit: string;
    gracePeriodEndsAt?: string | null;
    limits: {
      planName: string;
      tier: string;
      maxCourses: number;
      platformCoversConnectFee?: boolean;
    };
  };
  upgradeOptions: Array<{
    tier: string;
    name: string;
    platformFeePercent: number;
    maxCourses: number;
    maxStudentsPerCourse: number;
    maxVideoMinutes?: number;
    storageLabel?: string;
    storageBytes: string;
    pricing:
      | { month: number; year: number }
      | { custom: true; startingAt: number }
      | null;
    features?: PlanFeatureFlags;
    enterpriseContact?: boolean;
  }>;
};

const PLAN_ACCENTS: Record<string, string> = {
  FREE: "from-gray-600/20 to-transparent",
  STARTER: "from-white/10 to-transparent",
  PRO: "from-white/15 to-transparent",
  ENTERPRISE: "from-gray-500/15 to-transparent",
};

function formatStorage(bytes: string) {
  const value = Number(bytes);
  if (!Number.isFinite(value)) return bytes;
  const gb = value / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = value / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

function storagePercent(used: string, limit: string) {
  const u = Number(used);
  const l = Number(limit);
  if (!Number.isFinite(u) || !Number.isFinite(l) || l <= 0) return 0;
  return Math.min(100, Math.round((u / l) * 100));
}

function isSelfServePricing(
  pricing: BillingData["upgradeOptions"][0]["pricing"],
): pricing is { month: number; year: number } {
  return (
    pricing != null &&
    typeof pricing === "object" &&
    "month" in pricing
  );
}

function isEnterprisePricing(
  pricing: BillingData["upgradeOptions"][0]["pricing"],
): pricing is { custom: true; startingAt: number } {
  return (
    pricing != null &&
    typeof pricing === "object" &&
    "startingAt" in pricing
  );
}

function subscriptionStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "GRACE_PERIOD":
      return "Grace period";
    case "PAST_DUE":
      return "Past due";
    case "CANCELED":
      return "Canceled";
    case "FREE_TRIAL":
      return "Trial";
    default:
      return status.replace(/_/g, " ").toLowerCase();
  }
}

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent ${className}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  children: ReactNode;
}) {
  const tones = {
    success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    neutral: "bg-surface-overlay text-text-secondary ring-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function AlertBanner({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
      : "border-red-500/30 bg-red-500/5 text-red-400";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-background-secondary/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-text-primary tabular-nums">{value}</p>
          {sub ? <p className="mt-0.5 text-xs text-text-secondary">{sub}</p> : null}
        </div>
        <Icon>{icon}</Icon>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-text-secondary max-w-2xl">{description}</p>
      ) : null}
    </div>
  );
}

export function OwnerBillingPageClient() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { connect, billing, sales, isLoading, error: loadError, refetch } = useBillingData();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [enterpriseCompany, setEnterpriseCompany] = useState("");
  const [enterpriseMessage, setEnterpriseMessage] = useState("");

  const billingData = billing as BillingData | null | undefined;

  const invalidateBilling = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.billing.connect });
    await queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription });
    await queryClient.invalidateQueries({ queryKey: queryKeys.billing.sales() });
  };

  const handleConnectSetup = async () => {
    setActionLoading("connect");
    try {
      const { url } = await api.connect.startOnboarding();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Stripe setup");
      setActionLoading(null);
    }
  };

  const handleStripeDashboard = async () => {
    setActionLoading("dashboard");
    try {
      const { url } = await api.connect.openDashboard();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open Stripe dashboard");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (planTier: string, interval: "month" | "year") => {
    setActionLoading(`${planTier}-${interval}`);
    try {
      const { checkoutUrl } = await api.billing.upgrade(planTier, interval);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start upgrade");
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading("cancel");
    try {
      await api.billing.cancel();
      await invalidateBilling();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("enterprise");
    setError("");
    setSuccess("");
    try {
      await api.billing.enterpriseInquiry({
        message: enterpriseMessage.trim(),
        companyName: enterpriseCompany.trim() || undefined,
      });
      setSuccess("Thanks — our team will contact you about Enterprise pricing.");
      setEnterpriseOpen(false);
      setEnterpriseMessage("");
      setEnterpriseCompany("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send inquiry");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (paymentId: string) => {
    setActionLoading(`refund-${paymentId}`);
    try {
      await api.ownerPayments.refund(paymentId);
      await invalidateBilling();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setActionLoading(null);
    }
  };

  const displayError =
    error ||
    (loadError instanceof Error ? loadError.message : loadError ? "Failed to load billing data" : "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  const currentTier = billingData?.currentPlan?.tier ?? "FREE";
  const connectSuccess = searchParams.get("connect") === "success";
  const upgradeSuccess = searchParams.get("upgrade") === "success";
  const storagePct = billingData
    ? storagePercent(billingData.usage.storageBytesUsed, billingData.usage.storageBytesLimit)
    : 0;
  const connectFeeCovered =
    billingData?.entitlements?.platformCoversConnectFee ||
    billingData?.usage.limits.platformCoversConnectFee;

  return (
    <OwnerPageShell
      eyebrow="Account"
      title="Billing"
      subtitle="Plan, payouts & sales."
      contentClassName="space-y-8 max-w-6xl"
    >
        {(connectSuccess || upgradeSuccess || success || displayError) && (
          <div className="space-y-3">
            {connectSuccess ? (
              <AlertBanner tone="success">
                Stripe setup submitted — your payout status will refresh in a moment.
              </AlertBanner>
            ) : null}
            {upgradeSuccess ? (
              <AlertBanner tone="success">
                Plan upgraded successfully. Your new limits are active.
              </AlertBanner>
            ) : null}
            {success ? <AlertBanner tone="success">{success}</AlertBanner> : null}
            {displayError ? <AlertBanner tone="error">{displayError}</AlertBanner> : null}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Card variant="elevated" padding="lg" className="lg:col-span-3 relative overflow-hidden">
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${PLAN_ACCENTS[currentTier] ?? PLAN_ACCENTS.FREE}`}
            />
            <div className="relative">
              <SectionTitle
                title="Current plan"
                description="Platform subscription for courses, storage, and tools."
              />
              {billingData ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-text-primary">
                      {billingData.currentPlan?.name ?? "Free"}
                    </h3>
                    {billingData.subscription?.status ? (
                      <StatusBadge
                        tone={
                          billingData.subscription.status === "ACTIVE"
                            ? "success"
                            : billingData.subscription.status === "GRACE_PERIOD"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {subscriptionStatusLabel(billingData.subscription.status)}
                      </StatusBadge>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricTile
                      label="Courses"
                      value={String(billingData.usage.courseCount)}
                      sub={
                        billingData.usage.limits.maxCourses > 0
                          ? `of ${billingData.usage.limits.maxCourses} included`
                          : "Unlimited on plan"
                      }
                      icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      }
                    />
                    <MetricTile
                      label="Platform fee"
                      value={`${(billingData.currentPlan?.platformFeeBps ?? 1000) / 100}%`}
                      sub="On each course sale"
                      icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    />
                    <MetricTile
                      label="Storage"
                      value={formatStorage(billingData.usage.storageBytesUsed)}
                      sub={`of ${formatStorage(billingData.usage.storageBytesLimit)}`}
                      icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                          />
                        </svg>
                      }
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
                      <span>Storage used</span>
                      <span>{storagePct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-background-tertiary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/80 transition-all duration-500"
                        style={{ width: `${storagePct}%` }}
                      />
                    </div>
                  </div>

                  <p
                    className={`text-sm rounded-lg px-3 py-2.5 border ${
                      connectFeeCovered
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/90"
                        : "border-border-subtle bg-background-secondary text-text-tertiary"
                    }`}
                  >
                    {connectFeeCovered
                      ? "Stripe Connect account fee ($2/mo) is covered by Acadify on your plan."
                      : "Stripe charges a $2/month Connect account fee on your plan (billed by Stripe)."}
                  </p>

                  {billingData.subscription?.status === "GRACE_PERIOD" &&
                  billingData.usage.gracePeriodEndsAt ? (
                    <p className="text-sm text-amber-400">
                      Grace period until{" "}
                      {new Date(billingData.usage.gracePeriodEndsAt).toLocaleDateString()}.
                    </p>
                  ) : null}
                  {billingData.subscription?.cancelAtPeriodEnd &&
                  billingData.subscription.currentPeriodEnd ? (
                    <p className="text-sm text-text-tertiary">
                      Cancels on{" "}
                      {new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString()}.
                    </p>
                  ) : null}
                  {billingData.currentPlan?.tier !== "FREE" &&
                  billingData.subscription?.status === "ACTIVE" &&
                  !billingData.subscription?.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={actionLoading === "cancel"}
                      onClick={() => void handleCancelSubscription()}
                    >
                      Cancel at period end
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          <Card variant="elevated" padding="lg" className="lg:col-span-2 flex flex-col">
            <SectionTitle
              title="Course payments"
              description="Stripe Connect — students pay you directly."
            />
            {connect ? (
              <div className="flex flex-1 flex-col gap-5">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={connect.canAcceptPayments ? "success" : "warning"}>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${connect.canAcceptPayments ? "bg-emerald-400" : "bg-amber-400"}`}
                    />
                    {connect.canAcceptPayments ? "Ready for sales" : "Setup required"}
                  </StatusBadge>
                  {connect.payoutsEnabled ? (
                    <StatusBadge tone="success">Payouts enabled</StatusBadge>
                  ) : null}
                  {connect.chargesEnabled ? (
                    <StatusBadge tone="success">Charges enabled</StatusBadge>
                  ) : null}
                </div>

                <ul className="text-sm text-text-secondary space-y-2 flex-1">
                  <li className="flex gap-2">
                    <span className="text-text-tertiary">1.</span>
                    Connect your Stripe Express account
                  </li>
                  <li className="flex gap-2">
                    <span className="text-text-tertiary">2.</span>
                    Verify identity and bank details
                  </li>
                  <li className="flex gap-2">
                    <span className="text-text-tertiary">3.</span>
                    Publish paid courses and receive payouts
                  </li>
                </ul>

                <div className="pt-2">
                  {!connect.accountId || !connect.onboardingComplete ? (
                    <Button
                      fullWidth
                      onClick={() => void handleConnectSetup()}
                      loading={actionLoading === "connect"}
                    >
                      {connect.detailsSubmitted ? "Continue Stripe setup" : "Set up Stripe payouts"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => void handleStripeDashboard()}
                      loading={actionLoading === "dashboard"}
                    >
                      Open Stripe dashboard
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <section>
          <SectionTitle
            title="Plans"
            description="Upgrade for more courses, storage, lower fees, and advanced features."
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(billingData?.upgradeOptions ?? []).map((plan) => {
              const isCurrent = plan.tier === currentTier;
              const selfServe = isSelfServePricing(plan.pricing);
              const canUpgrade =
                selfServe &&
                plan.tier !== "FREE" &&
                !isCurrent &&
                !(currentTier === "PRO" && plan.tier === "STARTER");
              const featureLines = plan.features ? listEnabledFeatures(plan.features) : [];
              const isPopular = plan.tier === "STARTER";
              const yearlySave =
                selfServe && plan.pricing.month * 12 > plan.pricing.year
                  ? Math.round((1 - plan.pricing.year / (plan.pricing.month * 12)) * 100)
                  : null;

              return (
                <div
                  key={plan.tier}
                  className={`relative flex flex-col rounded-xl border bg-surface transition-shadow hover:shadow-lg ${
                    isCurrent
                      ? "border-accent/60 ring-2 ring-accent/20 shadow-md"
                      : isPopular
                        ? "border-border-strong"
                        : "border-border"
                  }`}
                >
                  {isPopular && !isCurrent ? (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-inverse">
                      Popular
                    </span>
                  ) : null}
                  {isCurrent ? (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-surface-raised border border-border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-primary">
                      Current
                    </span>
                  ) : null}

                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                      {plan.tier}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-text-primary">{plan.name}</h3>

                    <div className="mt-4 flex items-baseline gap-1">
                      {selfServe ? (
                        <>
                          <span className="text-3xl font-bold text-text-primary tabular-nums">
                            ${plan.pricing.month}
                          </span>
                          <span className="text-sm text-text-tertiary">/mo</span>
                        </>
                      ) : isEnterprisePricing(plan.pricing) ? (
                        <>
                          <span className="text-sm text-text-tertiary">From</span>
                          <span className="text-3xl font-bold text-text-primary tabular-nums ml-1">
                            ${plan.pricing.startingAt}
                          </span>
                          <span className="text-sm text-text-tertiary">/mo</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-text-primary">$0</span>
                          <span className="text-sm text-text-tertiary">/mo</span>
                        </>
                      )}
                    </div>

                    {yearlySave != null && yearlySave > 0 ? (
                      <p className="mt-1 text-xs text-emerald-400/90">
                        Save {yearlySave}% with yearly billing
                      </p>
                    ) : null}

                    <ul className="mt-5 flex-1 space-y-2.5 text-sm text-text-secondary border-t border-border-subtle pt-5">
                      <li className="flex items-center gap-2">
                        <CheckIcon />
                        {plan.maxCourses < 0 ? "Unlimited" : plan.maxCourses} course
                        {plan.maxCourses === 1 ? "" : "s"}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon />
                        {plan.maxStudentsPerCourse.toLocaleString()} students / course
                      </li>
                      {plan.maxVideoMinutes ? (
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          {plan.maxVideoMinutes} min video max
                        </li>
                      ) : null}
                      <li className="flex items-center gap-2">
                        <CheckIcon />
                        {plan.storageLabel ?? formatStorage(plan.storageBytes)} storage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon />
                        {plan.platformFeePercent}% platform fee
                      </li>
                      {featureLines.slice(0, 3).map((line) => (
                        <li key={line} className="flex items-center gap-2 text-text-tertiary">
                          <CheckIcon muted />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 space-y-2">
                      {isCurrent ? (
                        <Button disabled fullWidth variant="secondary">
                          Current plan
                        </Button>
                      ) : canUpgrade ? (
                        <>
                          <Button
                            fullWidth
                            loading={actionLoading === `${plan.tier}-month`}
                            onClick={() => void handleUpgrade(plan.tier, "month")}
                          >
                            Upgrade — monthly
                          </Button>
                          <Button
                            variant="outline"
                            fullWidth
                            loading={actionLoading === `${plan.tier}-year`}
                            onClick={() => void handleUpgrade(plan.tier, "year")}
                          >
                            Yearly · ${plan.pricing.year}/yr
                          </Button>
                        </>
                      ) : plan.tier === "FREE" ? (
                        <Button disabled variant="outline" fullWidth>
                          Included
                        </Button>
                      ) : plan.enterpriseContact ? (
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => setEnterpriseOpen(true)}
                        >
                          Contact sales
                        </Button>
                      ) : (
                        <Button disabled variant="outline" fullWidth>
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {enterpriseOpen ? (
          <Card variant="elevated" padding="lg" className="max-w-xl">
            <SectionTitle
              title="Enterprise inquiry"
              description="Custom storage, 0% platform fee, SSO, and dedicated support."
            />
            <form onSubmit={(e) => void handleEnterpriseSubmit(e)} className="space-y-4">
              <Input
                label="Company (optional)"
                value={enterpriseCompany}
                onChange={(e) => setEnterpriseCompany(e.target.value)}
              />
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Message</label>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-border bg-background-primary px-3 py-2.5 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-border-focus transition-shadow"
                  required
                  minLength={10}
                  value={enterpriseMessage}
                  onChange={(e) => setEnterpriseMessage(e.target.value)}
                  placeholder="Team size, training goals, timeline..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={actionLoading === "enterprise"}>
                  Send inquiry
                </Button>
                <Button type="button" variant="outline" onClick={() => setEnterpriseOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : null}

        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <SectionTitle
              title="Course sales & refunds"
              description="Recent completed payments from your academy."
            />
          </div>
          {sales.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-7 w-7 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <p className="text-text-primary font-medium">No sales yet</p>
              <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                When students purchase paid courses, transactions will appear here with refund
                options.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-background-hover/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{sale.course.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {sale.student.name}
                      <span className="text-text-tertiary mx-1.5">·</span>
                      <span className="tabular-nums font-medium text-text-primary">
                        ${sale.amount.toFixed(2)}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge
                        tone={
                          sale.status === "COMPLETED"
                            ? "success"
                            : sale.status === "REFUNDED"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {sale.status.replace(/_/g, " ")}
                      </StatusBadge>
                      <span className="text-xs text-text-tertiary">
                        {new Date(sale.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {sale.status === "COMPLETED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      loading={actionLoading === `refund-${sale.id}`}
                      onClick={() => void handleRefund(sale.id)}
                    >
                      Issue refund
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
    </OwnerPageShell>
  );
}

function CheckIcon({ muted }: { muted?: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${muted ? "text-text-tertiary" : "text-emerald-500/80"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
