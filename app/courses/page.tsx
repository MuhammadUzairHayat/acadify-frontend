import { CoursesPageClient } from "@/components/pages/courses/CoursesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchCoursesPage } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchCoursesPage(qc, sp),
    <CoursesPageClient />,
  );
}
