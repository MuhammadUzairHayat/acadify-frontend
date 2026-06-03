"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { queryKeys } from "@/lib/query-keys";
import { useAuthProfile } from "@/hooks/useAuth";
import { useAcademyStats, useMyAcademy, useRecentEnrollments } from "@/hooks/useOwner";

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

export function OwnerDashboardPageClient() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthProfile();
  const { data: statsData, isLoading: statsLoading } = useAcademyStats();
  const { data: academyData, isLoading: academyLoading } = useMyAcademy();
  const { data: recentEnrollments = [], isLoading: enrollmentsLoading } =
    useRecentEnrollments(5);

  const loading = statsLoading || academyLoading || enrollmentsLoading;

  const stats: Stats = (() => {
    if (!statsData) return { totalCourses: 0, totalStudents: 0, totalRevenue: 0 };
    const raw = statsData as { stats?: Stats } & Stats;
    return raw.stats ?? raw;
  })();

  const academy = academyData as {
    id: string;
    name: string;
    isApproved: boolean;
  } | null | undefined;

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.academies.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [queryClient]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <OwnerPageShell
      eyebrow="Overview"
      title={`Hi, ${firstName}`}
      subtitle="Academy snapshot."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {academy && !academy.isApproved ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Pending approval
            </span>
          ) : null}
          <Link href="/owner/academy/edit">
            <Button variant="outline" size="sm" className="rounded-xl">
              Academy settings
            </Button>
          </Link>
        </div>
      }
    >
      <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" stagger={80}>
        {[
          { label: "Courses", value: stats.totalCourses },
          { label: "Students", value: stats.totalStudents },
          { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
        ].map((stat, index) => (
          <RevealItem key={stat.label} index={index}>
            <Card padding="lg" className="border-border-subtle bg-surface/40">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-2 tabular-nums">
                {stat.value}
              </p>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" stagger={90}>
        <RevealItem index={0}>
          <Link href="/owner/courses/create">
            <Card padding="lg" className="border-border-subtle bg-surface/40 hover:border-border transition-colors h-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">New</p>
              <h3 className="font-semibold text-text-primary">Create course</h3>
              <p className="text-xs text-text-tertiary mt-1">Add to your catalog</p>
            </Card>
          </Link>
        </RevealItem>
        <RevealItem index={1}>
          <Link href="/owner/courses">
            <Card padding="lg" className="border-border-subtle bg-surface/40 hover:border-border transition-colors h-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">Manage</p>
              <h3 className="font-semibold text-text-primary">All courses</h3>
              <p className="text-xs text-text-tertiary mt-1">Edit & publish</p>
            </Card>
          </Link>
        </RevealItem>
      </RevealGroup>

      <RevealOnScroll>
        <Card padding="lg" className="border-border-subtle bg-surface/40">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary mb-1">
                Recent
              </p>
              <h2 className="text-lg font-bold text-text-primary">Enrollments</h2>
            </div>
            <Link href="/owner/enrollments">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">No enrollments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="py-2 text-text-tertiary font-medium">Student</th>
                    <th className="py-2 text-text-tertiary font-medium">Course</th>
                    <th className="py-2 text-text-tertiary font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-border-subtle last:border-0">
                      <td className="py-3">
                        <p className="text-text-primary font-medium">{enrollment.student?.name ?? "—"}</p>
                        <p className="text-text-tertiary text-xs">{enrollment.student?.email ?? "—"}</p>
                      </td>
                      <td className="py-3 text-text-primary">
                        {(enrollment as { course?: { title?: string } }).course?.title ?? "—"}
                      </td>
                      <td className="py-3 text-text-tertiary text-xs">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </RevealOnScroll>
    </OwnerPageShell>
  );
}
