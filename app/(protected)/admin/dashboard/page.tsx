import { AdminDashboardPageClient } from "@/components/pages/admin/AdminDashboardPageClient";
import { requireSession } from "@/lib/server/session";

export default async function AdminDashboardPage() {
  await requireSession("ADMIN");
  return <AdminDashboardPageClient />;
}
