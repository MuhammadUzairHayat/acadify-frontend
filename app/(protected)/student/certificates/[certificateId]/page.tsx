import { StudentCertificatescertificateIdPageClient } from "@/components/pages/student/certificates/[certificateId]/StudentCertificatescertificateIdPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchStudentCertificate } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ certificateId: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("STUDENT");
  const { certificateId } = await params;
  return renderPrefetched(
    (qc) => prefetchStudentCertificate(qc, certificateId),
    <StudentCertificatescertificateIdPageClient />,
  );
}
