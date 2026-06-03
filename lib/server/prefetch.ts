import type { QueryClient } from "@tanstack/react-query";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { User } from "@/lib/types";
import * as fetchers from "@/lib/server/fetchers";
import type { BrowseAcademiesOptions } from "@/lib/server/fetchers";
import type { BrowseCoursesOptions } from "@/lib/server/fetchers";
import type { EnrollmentListOptions } from "@/lib/server/fetchers";

export async function prefetchAuthProfile(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: fetchers.fetchAuthProfile,
    staleTime: STALE_TIMES.profile,
  });
}

export async function prefetchStudentDashboard(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.student.dashboard,
    queryFn: fetchers.fetchStudentDashboard,
    staleTime: STALE_TIMES.dashboard,
  });
}

export async function prefetchStudentProfile(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.student.profile,
    queryFn: fetchers.fetchStudentProfile,
    staleTime: STALE_TIMES.profile,
  });
}

export async function prefetchStudentCourses(
  qc: QueryClient,
  filters: { search?: string; status?: "IN_PROGRESS" | "COMPLETED"; limit?: number } = {},
) {
  const limit = filters.limit ?? 24;
  await qc.prefetchInfiniteQuery({
    queryKey: queryKeys.student.courses({ ...filters, limit }),
    queryFn: async () => fetchers.fetchStudentCourses({ ...filters, page: 1, limit }),
    initialPageParam: 1,
    staleTime: STALE_TIMES.dashboard,
  });
}

export async function prefetchStudentNotifications(
  qc: QueryClient,
  filters: { isRead?: "true" | "false"; limit?: number } = {},
) {
  const limit = filters.limit ?? 50;
  await qc.prefetchInfiniteQuery({
    queryKey: queryKeys.student.notifications({ ...filters, limit }),
    queryFn: async () =>
      fetchers.fetchStudentNotifications({ ...filters, page: 1, limit }),
    initialPageParam: 1,
    staleTime: STALE_TIMES.dashboard,
  });
}

export async function prefetchCoursePlayer(qc: QueryClient, courseId: string) {
  await qc.prefetchQuery({
    queryKey: queryKeys.student.player(courseId),
    queryFn: () => fetchers.fetchCoursePlayer(courseId),
    staleTime: STALE_TIMES.detail,
  });
}

export async function prefetchStudentCertificates(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.student.certificates,
    queryFn: fetchers.fetchStudentCertificates,
    staleTime: STALE_TIMES.dashboard,
  });
}

export async function prefetchStudentCertificate(
  qc: QueryClient,
  certificateId: string,
) {
  await qc.prefetchQuery({
    queryKey: queryKeys.student.certificate(certificateId),
    queryFn: () => fetchers.fetchStudentCertificate(certificateId),
    staleTime: STALE_TIMES.detail,
  });
}

export async function prefetchHomePage(qc: QueryClient) {
  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.academies.topRated(4),
      queryFn: () => fetchers.fetchTopAcademies(4),
      staleTime: STALE_TIMES.topRated,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.trending(4),
      queryFn: () => fetchers.fetchTrendingCourses(4),
      staleTime: STALE_TIMES.browse,
    }),
  ]);
}

export async function prefetchCoursesCatalog(qc: QueryClient) {
  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.courses.categories,
      queryFn: fetchers.fetchCourseCategories,
      staleTime: STALE_TIMES.categories,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.trending(3),
      queryFn: () => fetchers.fetchTrendingCourses(3),
      staleTime: STALE_TIMES.browse,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.featured(3),
      queryFn: () => fetchers.fetchFeaturedCourses(3),
      staleTime: STALE_TIMES.browse,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.new(4),
      queryFn: () => fetchers.fetchNewCourses(4),
      staleTime: STALE_TIMES.browse,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.free(4),
      queryFn: () => fetchers.fetchFreeCourses(4),
      staleTime: STALE_TIMES.browse,
    }),
  ]);
}

function parseCourseBrowseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): BrowseCoursesOptions & { hasFilters: boolean } {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === "string" ? v : undefined;
  };

  const search = get("search");
  const category = get("category") || "All";
  const level = get("level") || "All";
  const priceRange = get("priceRange") as BrowseCoursesOptions["priceRange"];
  const sort = (get("sort") || "best_rated") as BrowseCoursesOptions["sort"];

  const hasFilters =
    !!search ||
    category !== "All" ||
    level !== "All" ||
    !!priceRange;

  return {
    search: search || undefined,
    category: category !== "All" ? category : undefined,
    level: level !== "All" ? level : undefined,
    priceRange,
    sort,
    page: 1,
    limit: 12,
    hasFilters,
  };
}

export async function prefetchCoursesPage(
  qc: QueryClient,
  searchParams: Record<string, string | string[] | undefined> = {},
) {
  const { hasFilters, ...browseOpts } = parseCourseBrowseFilters(searchParams);

  await prefetchCoursesCatalog(qc);

  if (!hasFilters) {
    // catalog sections already prefetched
  }

  const filters = {
    search: browseOpts.search,
    category: browseOpts.category,
    level: browseOpts.level,
    priceRange: browseOpts.priceRange,
    sort: browseOpts.sort,
  };

  await qc.prefetchInfiniteQuery({
    queryKey: queryKeys.courses.browse(filters),
    queryFn: async () => fetchers.fetchBrowseCourses(browseOpts),
    initialPageParam: 1,
    staleTime: STALE_TIMES.browse,
  });
}

export async function prefetchCourseBySlug(qc: QueryClient, slug: string) {
  await qc.prefetchQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: () => fetchers.fetchCourseBySlug(slug),
    staleTime: STALE_TIMES.detail,
  });
}

function parseAcademyBrowseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): BrowseAcademiesOptions {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === "string" ? v : undefined;
  };

  const category = get("category") || "All";
  return {
    search: get("search") || undefined,
    category: category !== "All" ? category : undefined,
    priceRange: get("priceRange") as BrowseAcademiesOptions["priceRange"],
    sort: (get("sort") || "best_rated") as BrowseAcademiesOptions["sort"],
    page: 1,
    limit: 12,
  };
}

export async function prefetchAcademiesPage(
  qc: QueryClient,
  searchParams: Record<string, string | string[] | undefined> = {},
) {
  const browseOpts = parseAcademyBrowseFilters(searchParams);

  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.academies.categories,
      queryFn: fetchers.fetchAcademyCategories,
      staleTime: STALE_TIMES.categories,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.academies.topRated(3),
      queryFn: () => fetchers.fetchTopAcademies(3),
      staleTime: STALE_TIMES.topRated,
    }),
  ]);

  const filters = {
    search: browseOpts.search,
    category: browseOpts.category,
    priceRange: browseOpts.priceRange,
    sort: browseOpts.sort,
  };

  await qc.prefetchInfiniteQuery({
    queryKey: queryKeys.academies.browse(filters),
    queryFn: async () => fetchers.fetchBrowseAcademies(browseOpts),
    initialPageParam: 1,
    staleTime: STALE_TIMES.browse,
  });
}

export async function prefetchAcademyBySlug(qc: QueryClient, slug: string) {
  await qc.prefetchQuery({
    queryKey: queryKeys.academies.detail(slug),
    queryFn: () => fetchers.fetchAcademyBySlug(slug),
    staleTime: STALE_TIMES.detail,
  });
}

export async function prefetchOwnerDashboard(qc: QueryClient) {
  await Promise.all([
    prefetchAuthProfile(qc),
    qc.prefetchQuery({
      queryKey: queryKeys.academies.stats,
      queryFn: fetchers.fetchAcademyStats,
      staleTime: STALE_TIMES.stats,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.academies.my,
      queryFn: fetchers.fetchMyAcademy,
      staleTime: STALE_TIMES.owner,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.enrollments.recent(5),
      queryFn: async () => {
        const result = await fetchers.fetchEnrollmentList({
          page: 1,
          limit: 5,
          sortBy: "enrolledAt",
          sortOrder: "desc",
        });
        return Array.isArray(result?.data) ? result.data : [];
      },
      staleTime: STALE_TIMES.enrollments,
    }),
  ]);
}

export async function prefetchMyAcademy(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.academies.my,
    queryFn: fetchers.fetchMyAcademy,
    staleTime: STALE_TIMES.owner,
  });
}

export async function prefetchMyCourses(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: queryKeys.courses.owner.all,
    queryFn: fetchers.fetchMyCourses,
    staleTime: STALE_TIMES.owner,
  });
}

export async function prefetchOwnerCourse(qc: QueryClient, courseId: string) {
  await qc.prefetchQuery({
    queryKey: queryKeys.courses.owner.detail(courseId),
    queryFn: () => fetchers.fetchOwnerCourse(courseId),
    staleTime: STALE_TIMES.owner,
  });
}

export async function prefetchCourseSections(qc: QueryClient, courseId: string) {
  await Promise.all([
    prefetchOwnerCourse(qc, courseId),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.owner.sections(courseId),
      queryFn: () => fetchers.fetchCourseSections(courseId),
      staleTime: STALE_TIMES.owner,
    }),
  ]);
}

export async function prefetchCourseAnnouncements(
  qc: QueryClient,
  courseId: string,
) {
  await Promise.all([
    prefetchOwnerCourse(qc, courseId),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.owner.announcements(courseId, ""),
      queryFn: () => fetchers.fetchCourseAnnouncements(courseId),
      staleTime: STALE_TIMES.owner,
    }),
  ]);
}

export async function prefetchCourseStudents(
  qc: QueryClient,
  courseId: string,
) {
  await Promise.all([
    prefetchOwnerCourse(qc, courseId),
    qc.prefetchQuery({
      queryKey: queryKeys.courses.owner.students(courseId, {}),
      queryFn: () => fetchers.fetchCourseStudents(courseId, {}),
      staleTime: STALE_TIMES.owner,
    }),
  ]);
}

export async function prefetchOwnerBilling(qc: QueryClient) {
  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.billing.connect,
      queryFn: fetchers.fetchConnectStatus,
      staleTime: STALE_TIMES.billing,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.billing.subscription,
      queryFn: fetchers.fetchBillingPlans,
      staleTime: STALE_TIMES.billing,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.billing.sales(undefined),
      queryFn: () => fetchers.fetchOwnerSales(),
      staleTime: STALE_TIMES.billing,
    }),
  ]);
}

function parseEnrollmentFilters(
  searchParams: Record<string, string | string[] | undefined>,
): EnrollmentListOptions {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === "string" ? v : undefined;
  };

  return {
    search: get("search"),
    courseId: get("courseId"),
    status: get("status"),
    from: get("from"),
    to: get("to"),
    sortBy: get("sortBy") || "enrolledAt",
    sortOrder: (get("sortOrder") as "asc" | "desc") || "desc",
    page: 1,
    limit: 25,
  };
}

export async function prefetchOwnerEnrollments(
  qc: QueryClient,
  searchParams: Record<string, string | string[] | undefined> = {},
) {
  const listOpts = parseEnrollmentFilters(searchParams);
  const courseId = listOpts.courseId;

  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.enrollments.courses,
      queryFn: fetchers.fetchMyCourses,
      staleTime: STALE_TIMES.enrollments,
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.enrollments.stats(courseId),
      queryFn: () => fetchers.fetchEnrollmentStats(courseId),
      staleTime: STALE_TIMES.stats,
    }),
  ]);

  const filters = { ...listOpts, limit: listOpts.limit ?? 25 };
  await qc.prefetchInfiniteQuery({
    queryKey: queryKeys.enrollments.list(filters),
    queryFn: async () => fetchers.fetchEnrollmentList(listOpts),
    initialPageParam: 1,
    staleTime: STALE_TIMES.enrollments,
  });
}

export async function prefetchEnrollmentDetail(
  qc: QueryClient,
  enrollmentId: string,
) {
  await qc.prefetchQuery({
    queryKey: queryKeys.enrollments.detail(enrollmentId),
    queryFn: () => fetchers.fetchEnrollmentById(enrollmentId),
    staleTime: STALE_TIMES.enrollments,
  });
}

export type { User };
