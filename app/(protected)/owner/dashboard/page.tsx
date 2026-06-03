import { OwnerDashboardPageClient } from "@/components/pages/owner/dashboard/OwnerDashboardPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerDashboard } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchOwnerDashboard, <OwnerDashboardPageClient />);
}
