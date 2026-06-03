import { CoursesslugPageClient } from "@/components/pages/courses/[slug]/CoursesslugPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchCourseBySlug } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return renderPrefetched(
    (qc) => prefetchCourseBySlug(qc, slug),
    <CoursesslugPageClient />,
  );
}
