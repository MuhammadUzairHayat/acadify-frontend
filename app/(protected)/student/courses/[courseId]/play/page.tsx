import { StudentCoursescourseIdPlayPageClient } from "@/components/pages/student/courses/[courseId]/play/StudentCoursescourseIdPlayPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCoursePlayer } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ courseId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("STUDENT");
  const { courseId } = await params;
  return renderPrefetched(
    (qc) => prefetchCoursePlayer(qc, courseId),
    <StudentCoursescourseIdPlayPageClient />,
  );
}
