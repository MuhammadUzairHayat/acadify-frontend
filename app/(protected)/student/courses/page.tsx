import { StudentCoursesPageClient } from "@/components/pages/student/courses/StudentCoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCourses } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(
    (qc) => prefetchStudentCourses(qc, { limit: 24 }),
    <StudentCoursesPageClient />,
  );
}
