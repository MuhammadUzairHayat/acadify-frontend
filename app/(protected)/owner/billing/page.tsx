import { OwnerBillingPageClient } from "@/components/pages/owner/billing/OwnerBillingPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerBilling } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchOwnerBilling, <OwnerBillingPageClient />);
}
