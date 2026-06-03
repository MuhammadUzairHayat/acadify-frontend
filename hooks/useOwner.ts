"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { Announcement, Course, Enrollment } from "@/lib/types";

function unwrapCourses(response: unknown): Course[] {
  if (Array.isArray(response)) return response as Course[];
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as { data: Course[] }).data)
  ) {
    return (response as { data: Course[] }).data;
  }
  return [];
}

export function useMyAcademy() {
  return useQuery({
    queryKey: queryKeys.academies.my,
    queryFn: () => api.academy.getMy(),
    staleTime: STALE_TIMES.owner,
    retry: false,
  });
}

export function useAcademyStats() {
  return useQuery({
    queryKey: queryKeys.academies.stats,
    queryFn: () => api.academy.getStats(),
    staleTime: STALE_TIMES.stats,
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: queryKeys.courses.owner.all,
    queryFn: async () => unwrapCourses(await api.course.getMy()),
    staleTime: STALE_TIMES.owner,
  });
}

export function useOwnerCourse(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.owner.detail(courseId),
    queryFn: () => api.course.getById(courseId),
    enabled: !!courseId,
    staleTime: STALE_TIMES.owner,
  });
}

export function useCourseSections(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.owner.sections(courseId),
    queryFn: () => api.section.getByCourse(courseId),
    enabled: !!courseId,
    staleTime: STALE_TIMES.owner,
  });
}

type StudentFilters = {
  search?: string;
  sortBy?: "name" | "enrollmentDate" | "completionPercent";
  sortOrder?: "asc" | "desc";
};

export function useCourseStudents(courseId: string, filters: StudentFilters) {
  return useQuery({
    queryKey: queryKeys.courses.owner.students(courseId, filters),
    queryFn: () => api.course.getStudents(courseId, filters),
    enabled: !!courseId,
    staleTime: STALE_TIMES.owner,
  });
}

export function useCourseAnnouncements(courseId: string, search?: string) {
  return useQuery({
    queryKey: queryKeys.courses.owner.announcements(courseId, search),
    queryFn: () =>
      api.course.getAnnouncements(courseId, search) as Promise<Announcement[]>,
    enabled: !!courseId,
    staleTime: STALE_TIMES.owner,
  });
}

export function useEnrollmentDetail(enrollmentId: string) {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(enrollmentId),
    queryFn: () => api.enrollment.getById(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: STALE_TIMES.enrollments,
  });
}

export function useRecentEnrollments(limit = 5) {
  return useQuery({
    queryKey: queryKeys.enrollments.recent(limit),
    queryFn: async () => {
      const result = (await api.enrollment.list({
        page: 1,
        limit,
        sortBy: "enrolledAt",
        sortOrder: "desc",
      })) as { data: Enrollment[] };
      return Array.isArray(result?.data) ? result.data : [];
    },
    staleTime: STALE_TIMES.enrollments,
  });
}

export function useBillingData(courseId?: string) {
  const connect = useQuery({
    queryKey: queryKeys.billing.connect,
    queryFn: () => api.connect.getStatus(),
    staleTime: STALE_TIMES.billing,
  });

  const subscription = useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: () => api.billing.getPlans(),
    staleTime: STALE_TIMES.billing,
  });

  const sales = useQuery({
    queryKey: queryKeys.billing.sales(courseId),
    queryFn: () => api.ownerPayments.listSales(courseId),
    staleTime: STALE_TIMES.billing,
  });

  return {
    connect: connect.data,
    billing: subscription.data,
    sales: sales.data ?? [],
    isLoading: connect.isLoading || subscription.isLoading || sales.isLoading,
    error: connect.error || subscription.error || sales.error,
    refetch: () =>
      Promise.all([connect.refetch(), subscription.refetch(), sales.refetch()]),
  };
}
