"use client";

import { PageLoader } from "@/components/ui/PageLoader";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";
import { useAuthProfile } from "@/hooks/useAuth";
import { useQueryLoader } from "@/hooks/useQueryLoader";
import { useStudentDashboard } from "@/hooks/useStudent";

export function StudentDashboardPageClient() {
  const profileQuery = useAuthProfile();
  const dashboardQuery = useStudentDashboard();
  const profileLoading = useQueryLoader(profileQuery);
  const dashboardLoading = useQueryLoader(dashboardQuery);

  if (profileLoading || dashboardLoading) {
    return <PageLoader className="min-h-[50vh] p-8" />;
  }

  const user = profileQuery.data;
  const dashboard = dashboardQuery.data;

  if (!user || !dashboard) {
    return <PageLoader className="min-h-[50vh] p-8" />;
  }

  return <StudentDashboardView userName={user.name} dashboard={dashboard} />;
}
