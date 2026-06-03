import { StudentDashboardPageClient } from "@/components/pages/student/dashboard/StudentDashboardPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchAuthProfile, prefetchStudentDashboard } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(async (qc) => {
    await Promise.all([prefetchAuthProfile(qc), prefetchStudentDashboard(qc)]);
  }, <StudentDashboardPageClient />);
}
