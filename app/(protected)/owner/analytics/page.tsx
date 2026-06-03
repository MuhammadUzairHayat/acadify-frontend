import { OwnerAnalyticsPageClient } from "@/components/pages/owner/analytics/OwnerAnalyticsPageClient";
import { requireSession } from "@/lib/server/session";

export default async function OwnerAnalyticsPage() {
  await requireSession("OWNER");
  return <OwnerAnalyticsPageClient />;
}
