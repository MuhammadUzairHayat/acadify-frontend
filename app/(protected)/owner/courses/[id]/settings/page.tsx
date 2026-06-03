import { OwnerCoursesidSettingsPageClient } from "@/components/pages/owner/courses/[id]/settings/OwnerCoursesidSettingsPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchOwnerCourse } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchOwnerCourse(qc, id),
    <OwnerCoursesidSettingsPageClient />,
  );
}
