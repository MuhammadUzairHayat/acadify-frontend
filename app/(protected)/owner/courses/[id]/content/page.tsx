import { OwnerCoursesidContentPageClient } from "@/components/pages/owner/courses/[id]/content/OwnerCoursesidContentPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { requireSession } from "@/lib/server/session";
import { prefetchCourseSections } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  await requireSession("OWNER");
  const { id } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseSections(qc, id),
    <OwnerCoursesidContentPageClient />,
  );
}
