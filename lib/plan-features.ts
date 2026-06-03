export type PlanFeatureFlags = {
  affiliateMarketing: boolean;
  platformCoversConnectFee: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
};

export const PLAN_FEATURE_LABELS: Array<{
  key: keyof PlanFeatureFlags;
  label: string;
  shortLabel?: string;
}> = [
  { key: "platformCoversConnectFee", label: "Stripe Connect fee ($2/mo) covered by Acadify" },
  { key: "customDomain", label: "Custom domain" },
  { key: "affiliateMarketing", label: "Bulk enrollment & affiliate tools" },
  { key: "advancedAnalytics", label: "Advanced analytics & CSV export" },
  { key: "apiAccess", label: "API access" },
  { key: "prioritySupport", label: "Priority support" },
  { key: "whiteLabel", label: 'Remove "Powered by Acadify"' },
];

export function listEnabledFeatures(features: PlanFeatureFlags): string[] {
  return PLAN_FEATURE_LABELS.filter((f) => features[f.key]).map((f) => f.shortLabel ?? f.label);
}
