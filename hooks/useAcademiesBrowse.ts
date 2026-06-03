"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { AcademyListItem } from "@/lib/types";

export type AcademiesBrowseFilters = {
  search?: string;
  category?: string;
  priceRange?: "free" | "under_50" | "50_100" | "100_plus";
  minRating?: number;
  sort?:
    | "best_rated"
    | "most_reviewed"
    | "most_students"
    | "most_courses"
    | "newest";
};

type BrowsePage = {
  academies: AcademyListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function useAcademiesBrowse(filters: AcademiesBrowseFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.academies.browse(filters),
    queryFn: async ({ pageParam }) => {
      const result = (await api.academy.browse({
        ...filters,
        page: pageParam,
        limit: 12,
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

export function useTopAcademies(limit = 3) {
  return useQuery({
    queryKey: queryKeys.academies.topRated(limit),
    queryFn: () => api.academy.getTopRated(limit) as Promise<AcademyListItem[]>,
    staleTime: STALE_TIMES.topRated,
  });
}

export function useAcademyCategories() {
  return useQuery({
    queryKey: queryKeys.academies.categories,
    queryFn: () =>
      api.academy.getCategories() as Promise<
        { id: string; name: string; slug: string }[]
      >,
    staleTime: STALE_TIMES.categories,
  });
}
