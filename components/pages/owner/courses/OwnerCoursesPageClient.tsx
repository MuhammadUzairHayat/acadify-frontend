"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { RevealGroup, RevealItem } from "@/components/ui/RevealOnScroll";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { useMyCourses } from "@/hooks/useOwner";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  isPublished: boolean;
  _count?: { enrollments: number };
}

export function OwnerCoursesPageClient() {
  const queryClient = useQueryClient();
  const { data: courses = [], isLoading } = useMyCourses();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.owner.all });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await api.course.delete(id);
      await invalidate();
    } catch {
      alert("Failed to delete course");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) await api.course.unpublish(id);
      else await api.course.publish(id);
      await invalidate();
    } catch {
      alert("Failed to update status");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const courseList = courses as Course[];

  return (
    <OwnerPageShell
      eyebrow="Catalog"
      title="Courses"
      subtitle="Manage your offerings."
      action={
        <Link href="/owner/courses/create">
          <Button size="sm" className="rounded-xl">New course</Button>
        </Link>
      }
    >
      {courseList.length === 0 ? (
        <Card padding="lg" className="border-border-subtle bg-surface/40 text-center py-12">
          <p className="font-medium text-text-primary mb-1">No courses yet</p>
          <p className="text-sm text-text-secondary mb-4">Create your first course.</p>
          <Link href="/owner/courses/create">
            <Button size="sm" className="rounded-xl">Create course</Button>
          </Link>
        </Card>
      ) : (
        <RevealGroup className="space-y-3" stagger={70}>
          {courseList.map((course, index) => (
            <RevealItem key={course.id} index={index}>
              <Card padding="lg" className="border-border-subtle bg-surface/40">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-text-primary">{course.title}</h3>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          course.isPublished
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {course.isPublished ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-text-tertiary">
                      <span>{course.category}</span>
                      <span>{course.level}</span>
                      <span>{course._count?.enrollments || 0} students</span>
                      <span className="text-text-primary font-semibold">{formatCurrency(course.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link href={`/owner/courses/${course.id}/settings`}>
                      <Button variant="outline" size="sm" className="rounded-xl">Settings</Button>
                    </Link>
                    <Link href={`/owner/courses/${course.id}/students`}>
                      <Button variant="ghost" size="sm">Students</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(course.id, course.isPublished)}
                    >
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </OwnerPageShell>
  );
}
