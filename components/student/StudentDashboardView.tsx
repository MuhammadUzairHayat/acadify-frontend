"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { StudentDashboardData, StudentCourseEnrollment } from "@/lib/types";

type Props = {
  userName: string;
  dashboard: StudentDashboardData;
};

const STAT_LABELS = [
  { key: "enrolledCount" as const, label: "Enrolled" },
  { key: "inProgressCount" as const, label: "In progress" },
  { key: "completedCount" as const, label: "Completed" },
  { key: "totalHours" as const, label: "Hours" },
];

export function StudentDashboardView({ userName, dashboard }: Props) {
  const router = useRouter();
  const firstName = userName.split(" ")[0] || userName;

  return (
    <div className="min-h-screen">
      <StudentPageHeader
        eyebrow="Overview"
        title={`Hi, ${firstName}`}
        subtitle="Your learning at a glance."
      />

      <div className="px-6 md:px-8 py-8 space-y-8">
        <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={80}>
          {STAT_LABELS.map((stat, index) => (
            <RevealItem key={stat.key} index={index}>
              <Card padding="lg" className="border-border-subtle bg-surface/40">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-text-primary mt-2 tabular-nums">
                  {dashboard?.[stat.key] ?? 0}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        <RevealOnScroll>
          <Card padding="lg" className="border-border-subtle bg-surface/40">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary mb-1">
                  Continue
                </p>
                <h2 className="text-lg font-bold text-text-primary">Keep learning</h2>
              </div>
              <Link href="/student/courses">
                <Button variant="outline" size="sm" className="rounded-xl">
                  View all
                </Button>
              </Link>
            </div>

            {(dashboard?.continueLearning || []).length === 0 ? (
              <p className="text-sm text-text-secondary">Nothing in progress yet.</p>
            ) : (
              <RevealGroup className="grid md:grid-cols-2 gap-4" stagger={90}>
                {(dashboard?.continueLearning || []).map(
                  (enrollment: StudentCourseEnrollment, index) => (
                    <RevealItem key={enrollment.id} index={index}>
                      <div className="rounded-xl border border-border-subtle bg-background-secondary/50 p-4">
                        <h3 className="font-semibold text-text-primary line-clamp-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-xs text-text-tertiary mt-1 mb-3">
                          {enrollment.progressPercent ?? 0}% done
                        </p>
                        <div className="h-1.5 bg-background-primary rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, enrollment.progressPercent ?? 0)}%`,
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() =>
                            router.push(`/student/courses/${enrollment.course.id}/play`)
                          }
                        >
                          Continue
                        </Button>
                      </div>
                    </RevealItem>
                  ),
                )}
              </RevealGroup>
            )}
          </Card>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <Card padding="lg" className="border-border-subtle bg-surface/40">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary mb-1">
              Done
            </p>
            <h2 className="text-lg font-bold text-text-primary mb-5">Recently completed</h2>

            {(dashboard?.recentCompleted || []).length === 0 ? (
              <p className="text-sm text-text-secondary">No completions yet.</p>
            ) : (
              <div className="space-y-3">
                {(dashboard?.recentCompleted || []).map(
                  (enrollment: StudentCourseEnrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-border-subtle last:border-0"
                    >
                      <p className="font-medium text-text-primary text-sm line-clamp-1">
                        {enrollment.course.title}
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                        Done
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>
        </RevealOnScroll>
      </div>
    </div>
  );
}
