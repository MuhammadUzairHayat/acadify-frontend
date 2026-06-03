"use client";

import type { ReactNode } from "react";
import CourseTabs from "@/components/owner/CourseTabs";

type Props = {
  courseId: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function OwnerCoursePageHeader({
  courseId,
  eyebrow = "Course",
  title,
  subtitle,
  action,
}: Props) {
  return (
    <section className="relative border-b border-border-subtle overflow-hidden">
      <div className="absolute inset-0 home-grid-bg opacity-30 pointer-events-none" />
      <div className="relative px-6 md:px-8 pt-8 pb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-2">
          {eyebrow}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-text-secondary mt-1 truncate">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <CourseTabs courseId={courseId} />
      </div>
    </section>
  );
}
