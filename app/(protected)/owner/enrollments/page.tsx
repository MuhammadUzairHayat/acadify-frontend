import { OwnerEnrollmentsPageClient } from "@/components/pages/owner/enrollments/OwnerEnrollmentsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerEnrollments } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  await requireSession("OWNER");
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchOwnerEnrollments(qc, sp),
    <OwnerEnrollmentsPageClient />,
  );
}
