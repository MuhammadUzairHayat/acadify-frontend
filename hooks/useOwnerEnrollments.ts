"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { Enrollment, EnrollmentStats } from "@/lib/types";

export type EnrollmentListFilters = {
  search?: string;
  courseId?: string;
  status?: Enrollment["status"];
  from?: string;
  to?: string;
  sortBy?:
    | "studentName"
    | "studentEmail"
    | "courseTitle"
    | "enrolledAt"
    | "status"
    | "progressPercent"
    | "lastAccessedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
};

type EnrollmentPage = {
  data: Enrollment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function useOwnerEnrollments(filters: EnrollmentListFilters) {
  const limit = filters.limit ?? 25;

  return useInfiniteQuery({
    queryKey: queryKeys.enrollments.list({ ...filters, limit }),
    queryFn: async ({ pageParam }) => {
      const result = (await api.enrollment.list({
        ...filters,
        page: pageParam,
        limit,
      })) as EnrollmentPage;
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: STALE_TIMES.enrollments,
  });
}

export function useEnrollmentStats(courseId?: string) {
  return useQuery({
    queryKey: queryKeys.enrollments.stats(courseId),
    queryFn: () =>
      api.enrollment.getStats({
        courseId: courseId || undefined,
      }) as Promise<EnrollmentStats>,
    staleTime: STALE_TIMES.stats,
  });
}

export function useOwnerCoursesForEnrollments() {
  return useQuery({
    queryKey: queryKeys.enrollments.courses,
    queryFn: async () => {
      const response = await api.course.getMy();
      return (
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []
      ) as import("@/lib/types").Course[];
    },
    staleTime: STALE_TIMES.enrollments,
  });
}

export { useMyCourses } from "./useOwner";
