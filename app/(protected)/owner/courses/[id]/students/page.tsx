import { OwnerCoursesidStudentsPageClient } from "@/components/pages/owner/courses/[id]/students/OwnerCoursesidStudentsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseStudents } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseStudents(qc, id),
    <OwnerCoursesidStudentsPageClient />,
  );
}
