import { OwnerCoursesidAnnouncementsPageClient } from "@/components/pages/owner/courses/[id]/announcements/OwnerCoursesidAnnouncementsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseAnnouncements } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseAnnouncements(qc, id),
    <OwnerCoursesidAnnouncementsPageClient />,
  );
}
