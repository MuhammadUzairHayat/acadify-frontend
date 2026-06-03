import { OwnerCoursesPageClient } from "@/components/pages/owner/courses/OwnerCoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchMyCourses } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("OWNER");
  return renderPrefetched(prefetchMyCourses, <OwnerCoursesPageClient />);
}
