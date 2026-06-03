import { OwnerCoursesCreatePageClient } from "@/components/pages/owner/courses/create/OwnerCoursesCreatePageClient";
import { requireSession } from "@/lib/server/session";

export default async function Page() {
  await requireSession("OWNER");
  return <OwnerCoursesCreatePageClient />;
}
