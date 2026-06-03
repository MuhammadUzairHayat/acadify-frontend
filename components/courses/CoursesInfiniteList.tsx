"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { CourseCard } from "@/components/courses/CourseCard";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  useCoursesBrowse,
  type CoursesBrowseFilters,
} from "@/hooks/useCoursesBrowse";
import type { CourseListItem } from "@/lib/types";

type Props = {
  filters: CoursesBrowseFilters;
  onEnroll: (course: CourseListItem) => void;
  onClearFilters?: () => void;
  hideHeader?: boolean;
};

export function CoursesInfiniteList({
  filters,
  onEnroll,
  onClearFilters,
  hideHeader = false,
}: Props) {
  const {
    data,
    isLoading,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useCoursesBrowse(filters);

  const courses = data?.pages.flatMap((page) => page.courses) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  const loadMoreRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const listLoading =
    isLoading ||
    isPending ||
    (isFetching && !isFetchingNextPage && courses.length === 0);

  if (listLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <RevealOnScroll>
        <Card className="border-border-subtle bg-surface/40 text-center py-10">
          <p className="text-text-secondary text-sm">
            {error instanceof Error ? error.message : "Failed to load."}
          </p>
        </Card>
      </RevealOnScroll>
    );
  }

  if (courses.length === 0) {
    return (
      <RevealOnScroll>
        <Card className="border-border-subtle bg-surface/40 text-center py-10">
          <p className="text-text-secondary text-sm">No matches.</p>
          {onClearFilters ? (
            <Button className="mt-4" variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
        </Card>
      </RevealOnScroll>
    );
  }

  return (
    <section className={hideHeader ? "pt-2 border-t border-border-subtle" : ""}>
      <RevealOnScroll>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-1.5">
              Browse
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
              All courses
            </h2>
          </div>
          <p className="text-xs text-text-tertiary tabular-nums shrink-0 pb-0.5">
            {courses.length} / {total}
          </p>
        </div>
      </RevealOnScroll>

      <RevealGroup className="space-y-4" stagger={70}>
        {courses.map((course, index) => (
          <RevealItem key={course.id} index={index}>
            <CourseCard course={course} onEnroll={onEnroll} />
          </RevealItem>
        ))}
      </RevealGroup>

      <div ref={loadMoreRef} className="flex justify-center py-10 min-h-[48px]">
        {isFetchingNextPage ? <Loader /> : null}
        {hasNextPage && !isFetchingNextPage ? (
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        ) : null}
      </div>
    </section>
  );
}
