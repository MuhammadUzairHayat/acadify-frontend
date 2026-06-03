import { AcademiesPageClient } from "@/components/pages/academies/AcademiesPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchAcademiesPage } from "@/lib/server/prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  return renderPrefetched(
    (qc) => prefetchAcademiesPage(qc, sp),
    <AcademiesPageClient />,
  );
}
