"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { CourseListItem } from "@/lib/types";

export type CoursesBrowseFilters = {
  search?: string;
  category?: string;
  subcategory?: string;
  level?: string;
  priceRange?: "free" | "paid" | "under_50" | "50_100" | "100_plus";
  minRating?: string;
  academyId?: string;
  sort?:
    | "best_rated"
    | "most_enrolled"
    | "newest"
    | "price_asc"
    | "price_desc";
};

type BrowsePage = {
  courses: CourseListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function useCoursesBrowse(filters: CoursesBrowseFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.courses.browse(filters),
    queryFn: async ({ pageParam }) => {
      const result = (await api.coursePublic.browse({
        ...filters,
        page: pageParam,
        limit: 12,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
      })) as BrowsePage;
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: STALE_TIMES.browse,
  });
}
