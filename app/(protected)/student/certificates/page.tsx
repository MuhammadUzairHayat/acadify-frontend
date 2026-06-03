import { StudentCertificatesPageClient } from "@/components/pages/student/certificates/StudentCertificatesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCertificates } from "@/lib/server/prefetch";

export default async function Page() {
  await requireSession("STUDENT");
  return renderPrefetched(prefetchStudentCertificates, <StudentCertificatesPageClient />);
}
