import { StudentNotificationsPageClient } from "@/components/pages/student/notifications/StudentNotificationsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentNotifications } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(
    (qc) => prefetchStudentNotifications(qc, { limit: 50 }),
    <StudentNotificationsPageClient />,
  );
}
