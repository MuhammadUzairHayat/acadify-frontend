"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { AcademyDetail, CourseDetail, CourseListItem } from "@/lib/types";

export function useCourseCategories() {
  return useQuery({
    queryKey: queryKeys.courses.categories,
    queryFn: () =>
      api.coursePublic.getCategories() as Promise<
        { id: string; name: string; slug: string }[]
      >,
    staleTime: STALE_TIMES.categories,
  });
}

export function useCourseFilterAcademies() {
  return useQuery({
    queryKey: queryKeys.courses.filterAcademies,
    queryFn: () =>
      api.coursePublic.getAcademies() as Promise<
        { id: string; name: string; slug: string }[]
      >,
    staleTime: STALE_TIMES.categories,
  });
}

export function useTrendingCourses(limit = 3) {
  return useQuery({
    queryKey: queryKeys.courses.trending(limit),
    queryFn: () => api.coursePublic.getTrending(limit) as Promise<CourseListItem[]>,
    staleTime: STALE_TIMES.browse,
  });
}

export function useFeaturedCourses(limit = 3) {
  return useQuery({
    queryKey: queryKeys.courses.featured(limit),
    queryFn: () => api.coursePublic.getFeatured(limit) as Promise<CourseListItem[]>,
    staleTime: STALE_TIMES.browse,
  });
}

export function useNewCourses(limit = 4) {
  return useQuery({
    queryKey: queryKeys.courses.new(limit),
    queryFn: () => api.coursePublic.getNew(limit) as Promise<CourseListItem[]>,
    staleTime: STALE_TIMES.browse,
  });
}

export function useFreeCourses(limit = 4) {
  return useQuery({
    queryKey: queryKeys.courses.free(limit),
    queryFn: () => api.coursePublic.getFree(limit) as Promise<CourseListItem[]>,
    staleTime: STALE_TIMES.browse,
  });
}

export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: () => api.coursePublic.getBySlug(slug) as Promise<CourseDetail>,
    enabled: !!slug,
    staleTime: STALE_TIMES.detail,
  });
}

export function useAcademyBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.academies.detail(slug),
    queryFn: () => api.academy.getPublicBySlug(slug) as Promise<AcademyDetail>,
    enabled: !!slug,
    staleTime: STALE_TIMES.detail,
  });
}

export function useCourseCatalogSections(enabled: boolean) {
  const trending = useTrendingCourses(3);
  const featured = useFeaturedCourses(3);
  const newCourses = useNewCourses(4);
  const freeCourses = useFreeCourses(4);

  return {
    trending: trending.data ?? [],
    featured: featured.data ?? [],
    newCourses: newCourses.data ?? [],
    freeCourses: freeCourses.data ?? [],
    isLoading:
      enabled &&
      (trending.isLoading ||
        trending.isPending ||
        featured.isLoading ||
        featured.isPending ||
        newCourses.isLoading ||
        newCourses.isPending ||
        freeCourses.isLoading ||
        freeCourses.isPending ||
        ((!trending.data ||
          !featured.data ||
          !newCourses.data ||
          !freeCourses.data) &&
          (trending.isFetching ||
            featured.isFetching ||
            newCourses.isFetching ||
            freeCourses.isFetching))),
  };
}
