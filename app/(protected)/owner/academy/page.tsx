import { OwnerAcademyPageClient } from "@/components/pages/owner/academy/OwnerAcademyPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchMyAcademy } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchMyAcademy, <OwnerAcademyPageClient />);
}
