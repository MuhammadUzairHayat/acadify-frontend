import { AcademiesslugPageClient } from "@/components/pages/academies/[slug]/AcademiesslugPageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchAcademyBySlug } from "@/lib/server/prefetch";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return renderPrefetched(
    (qc) => prefetchAcademyBySlug(qc, slug),
    <AcademiesslugPageClient />,
  );
}
