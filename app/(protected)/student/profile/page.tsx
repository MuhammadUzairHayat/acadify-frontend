import { StudentProfilePageClient } from "@/components/pages/student/profile/StudentProfilePageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentProfile } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(prefetchStudentProfile, <StudentProfilePageClient />);
}
