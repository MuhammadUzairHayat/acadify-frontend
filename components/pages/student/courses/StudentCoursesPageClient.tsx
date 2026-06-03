"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useQueryLoader } from "@/hooks/useQueryLoader";
import { useStudentCourses } from "@/hooks/useStudent";

type FilterStatus = "ALL" | "IN_PROGRESS" | "COMPLETED";

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "IN_PROGRESS", label: "Active" },
  { id: "COMPLETED", label: "Done" },
];

export function StudentCoursesPageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("ALL");

  const courseFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      limit: 24,
    }),
    [search, status],
  );

  const coursesQuery = useStudentCourses(courseFilters);
  const coursesLoading = useQueryLoader(coursesQuery);
  const courses = coursesQuery.data?.pages.flatMap((page) => page.courses) ?? [];

  return (
    <div className="min-h-screen">
      <StudentPageHeader eyebrow="Learning" title="My courses" subtitle="Your enrollments." />

      <div className="px-6 md:px-8 py-8">
        <RevealOnScroll>
          <div className="flex flex-col lg:flex-row gap-3 mb-8">
            <div className="flex-1 flex items-center bg-surface/80 border border-border-subtle rounded-2xl p-1.5">
              <div className="flex-1 min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:ring-0 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:ring-0">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={status === item.id ? "primary" : "outline"}
                  className="rounded-xl"
                  onClick={() => setStatus(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {coursesLoading ? (
          <PageLoader />
        ) : courses.length === 0 ? (
          <RevealOnScroll>
            <Card padding="lg" className="border-border-subtle bg-surface/40 text-center py-12">
              <p className="text-text-primary font-medium mb-1">No courses yet</p>
              <p className="text-sm text-text-secondary mb-4">Browse the catalog to get started.</p>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Browse courses
                </Button>
              </Link>
            </Card>
          </RevealOnScroll>
        ) : (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" stagger={90}>
            {courses.map((enrollment, index) => {
              const progress = enrollment.progressPercent ?? 0;
              const isCompleted = progress >= 100 || enrollment.status === "COMPLETED";

              return (
                <RevealItem key={enrollment.id} index={index}>
                  <Card padding="lg" className="h-full flex flex-col border-border-subtle bg-surface/40">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary line-clamp-2">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-1 mb-4">
                        {progress}% · {isCompleted ? "Complete" : "In progress"}
                      </p>
                      <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl mt-5 w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/student/courses/${enrollment.course.id}/play`)
                      }
                    >
                      {isCompleted ? "Review" : "Continue"}
                    </Button>
                  </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
