import { OwnerEnrollmentsenrollmentIdPageClient } from "@/components/pages/owner/enrollments/[enrollmentId]/OwnerEnrollmentsenrollmentIdPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchEnrollmentDetail } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ enrollmentId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { enrollmentId } = await params;
  return renderPrefetched(
    (qc) => prefetchEnrollmentDetail(qc, enrollmentId),
    <OwnerEnrollmentsenrollmentIdPageClient />,
  );
}
