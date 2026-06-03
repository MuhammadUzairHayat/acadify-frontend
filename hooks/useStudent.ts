"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type {
  StudentCertificate,
  StudentCourseEnrollment,
  StudentDashboardData,
  StudentNotification,
  StudentPlayData,
  StudentProfile,
} from "@/lib/types";

export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.student.dashboard,
    queryFn: () => api.student.getDashboard() as Promise<StudentDashboardData>,
    staleTime: STALE_TIMES.dashboard,
  });
}

type StudentCoursesFilters = {
  status?: "ALL" | "IN_PROGRESS" | "COMPLETED";
  search?: string;
  limit?: number;
};

export function useStudentCourses(filters: StudentCoursesFilters) {
  const limit = filters.limit ?? 24;

  return useInfiniteQuery({
    queryKey: queryKeys.student.courses({ ...filters, limit }),
    queryFn: async ({ pageParam }) =>
      api.student.getCourses({
        ...filters,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: STALE_TIMES.dashboard,
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: queryKeys.student.profile,
    queryFn: () => api.student.getProfile() as Promise<StudentProfile>,
    staleTime: STALE_TIMES.profile,
  });
}

type NotificationFilters = {
  isRead?: "true" | "false";
  limit?: number;
};

export function useStudentNotifications(filters: NotificationFilters) {
  const limit = filters.limit ?? 50;

  return useInfiniteQuery({
    queryKey: queryKeys.student.notifications({ ...filters, limit }),
    queryFn: async ({ pageParam }) =>
      api.student.getNotifications({
        ...filters,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: STALE_TIMES.dashboard,
  });
}

export function useCoursePlayer(courseId: string) {
  return useQuery({
    queryKey: queryKeys.student.player(courseId),
    queryFn: () =>
      api.student.getCoursePlayer(courseId) as Promise<StudentPlayData>,
    enabled: !!courseId,
    staleTime: STALE_TIMES.detail,
  });
}

export function useStudentCertificates() {
  return useQuery({
    queryKey: queryKeys.student.certificates,
    queryFn: () =>
      api.student.getCertificates() as Promise<StudentCertificate[]>,
    staleTime: STALE_TIMES.dashboard,
  });
}

export function useStudentCertificate(certificateId: string) {
  return useQuery({
    queryKey: queryKeys.student.certificate(certificateId),
    queryFn: () =>
      api.student.getCertificate(certificateId) as Promise<
        StudentCertificate & { studentName: string; courseTitle: string }
      >,
    enabled: !!certificateId,
    staleTime: STALE_TIMES.detail,
  });
}

export type { StudentCourseEnrollment, StudentNotification };
