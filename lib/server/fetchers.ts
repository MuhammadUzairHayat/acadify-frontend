import { serverApiJson } from "@/lib/api-server";
import { unwrapData } from "@/lib/server/unwrap";
import type {
  AcademyDetail,
  AcademyListItem,
  Announcement,
  Course,
  CourseDetail,
  CourseListItem,
  CourseReviewItem,
  Enrollment,
  EnrollmentStats,
  StudentCertificate,
  StudentCourseEnrollment,
  StudentDashboardData,
  StudentNotification,
  StudentPlayData,
  StudentProfile,
  User,
} from "@/lib/types";

async function get<T>(path: string): Promise<T> {
  const data = await serverApiJson<unknown>(path);
  return unwrapData<T>(data);
}

async function getRaw<T>(path: string): Promise<T> {
  return serverApiJson<T>(path);
}

// ——— Auth ———
export async function fetchAuthProfile(): Promise<User | null> {
  try {
    const res = await getRaw<{ data?: { user: User }; user?: User }>(
      "/auth/profile",
    );
    return res.data?.user ?? res.user ?? null;
  } catch {
    return null;
  }
}

// ——— Public courses ———
export const fetchCourseCategories = () =>
  get<{ id: string; name: string; slug: string }[]>("/courses/categories");

export const fetchCourseFilterAcademies = () =>
  get<{ id: string; name: string; slug: string }[]>("/courses/academies");

export const fetchTrendingCourses = (limit = 3) =>
  get<CourseListItem[]>(`/courses/trending?limit=${limit}`);

export const fetchFeaturedCourses = (limit = 3) =>
  get<CourseListItem[]>(`/courses/featured?limit=${limit}`);

export const fetchNewCourses = (limit = 4) =>
  get<CourseListItem[]>(`/courses/new?limit=${limit}`);

export const fetchFreeCourses = (limit = 4) =>
  get<CourseListItem[]>(`/courses/free?limit=${limit}`);

export type BrowseCoursesOptions = {
  search?: string;
  category?: string;
  subcategory?: string;
  level?: string;
  priceRange?: "free" | "paid" | "under_50" | "50_100" | "100_plus";
  minRating?: number;
  academyId?: string;
  sort?: "best_rated" | "most_enrolled" | "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
};

export async function fetchBrowseCourses(options: BrowseCoursesOptions = {}) {
  const query = new URLSearchParams();
  if (options.search) query.set("search", options.search);
  if (options.category && options.category !== "All") {
    query.set("category", options.category);
  }
  if (options.subcategory) query.set("subcategory", options.subcategory);
  if (options.level && options.level !== "All") query.set("level", options.level);
  if (options.priceRange) query.set("priceRange", options.priceRange);
  if (options.minRating) query.set("minRating", String(options.minRating));
  if (options.academyId) query.set("academyId", options.academyId);
  if (options.sort) query.set("sort", options.sort);
  if (options.page) query.set("page", String(options.page));
  if (options.limit) query.set("limit", String(options.limit));

  const qs = query.toString();
  return get<{
    courses: CourseListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/courses/browse${qs ? `?${qs}` : ""}`);
}

export const fetchCourseBySlug = (slug: string) =>
  get<CourseDetail>(`/courses/by-slug/${slug}`);

// ——— Academies ———
export const fetchAcademyCategories = () =>
  get<{ id: string; name: string; slug: string }[]>("/academies/categories");

export const fetchTopAcademies = (limit = 4) =>
  get<AcademyListItem[]>(`/academies/top-rated?limit=${limit}`);

export type BrowseAcademiesOptions = {
  search?: string;
  category?: string;
  priceRange?: "free" | "under_50" | "50_100" | "100_plus";
  sort?: "best_rated" | "most_reviewed" | "most_students" | "most_courses" | "newest";
  page?: number;
  limit?: number;
};

export async function fetchBrowseAcademies(options: BrowseAcademiesOptions = {}) {
  const query = new URLSearchParams();
  if (options.search) query.set("search", options.search);
  if (options.category && options.category !== "All") {
    query.set("category", options.category);
  }
  if (options.priceRange) query.set("priceRange", options.priceRange);
  if (options.sort) query.set("sort", options.sort);
  if (options.page) query.set("page", String(options.page));
  if (options.limit) query.set("limit", String(options.limit));

  const qs = query.toString();
  return get<{
    academies: AcademyListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/academies${qs ? `?${qs}` : ""}`);
}

export const fetchAcademyBySlug = (slug: string) =>
  get<AcademyDetail>(`/academies/${slug}`);

// ——— Student ———
export const fetchStudentDashboard = () =>
  get<StudentDashboardData>("/student/dashboard");

export async function fetchStudentCourses(options?: {
  status?: "ALL" | "IN_PROGRESS" | "COMPLETED";
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (options?.status) query.set("status", options.status);
  if (options?.search) query.set("search", options.search);
  if (options?.page) query.set("page", String(options.page));
  if (options?.limit) query.set("limit", String(options.limit));
  const qs = query.toString();
  return getRaw<{
    courses: StudentCourseEnrollment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/student/courses${qs ? `?${qs}` : ""}`);
}

export const fetchStudentProfile = () =>
  get<StudentProfile>("/student/profile");

export async function fetchStudentNotifications(options?: {
  isRead?: "true" | "false";
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (options?.isRead) query.set("isRead", options.isRead);
  if (options?.page) query.set("page", String(options.page));
  if (options?.limit) query.set("limit", String(options.limit));
  const qs = query.toString();
  return get<{
    notifications: StudentNotification[];
    unreadCount: number;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/student/notifications${qs ? `?${qs}` : ""}`);
}

export const fetchCoursePlayer = (courseId: string) =>
  get<StudentPlayData>(`/student/courses/${courseId}/play`);

export const fetchStudentCertificates = () =>
  get<StudentCertificate[]>("/student/certificates");

export const fetchStudentCertificate = (certificateId: string) =>
  get<StudentCertificate & { studentName: string; courseTitle: string }>(
    `/student/certificates/${certificateId}`,
  );

// ——— Owner / academy ———
export const fetchMyAcademy = () => get<unknown>("/academy/my-academy");

export const fetchAcademyStats = () => get<unknown>("/academy/my-stats");

export async function fetchMyCourses(): Promise<Course[]> {
  const data = await getRaw<unknown>("/courses/my-courses");
  if (Array.isArray(data)) return data as Course[];
  if (data && typeof data === "object" && "data" in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as Course[];
  }
  return [];
}

export const fetchOwnerCourse = (id: string) => get<unknown>(`/courses/${id}`);

export const fetchCourseSections = (id: string) =>
  get<unknown>(`/courses/${id}/sections`);

export async function fetchCourseStudents(
  courseId: string,
  filters: Record<string, string | undefined> = {},
) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) query.set(k, v);
  });
  const qs = query.toString();
  return getRaw<unknown>(
    `/courses/${courseId}/students${qs ? `?${qs}` : ""}`,
  );
}

export const fetchCourseAnnouncements = (courseId: string, search?: string) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return get<Announcement[]>(`/courses/${courseId}/announcements${query}`);
};

export type EnrollmentListOptions = {
  search?: string;
  courseId?: string;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
};

export async function fetchEnrollmentList(options: EnrollmentListOptions = {}) {
  const query = new URLSearchParams();
  Object.entries(options).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });
  const qs = query.toString();
  return getRaw<{
    data: Enrollment[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/enrollments${qs ? `?${qs}` : ""}`);
}

export const fetchEnrollmentById = (id: string) =>
  get<Enrollment>(`/enrollments/${id}`);

export const fetchEnrollmentStats = (courseId?: string) => {
  const qs = courseId ? `?courseId=${courseId}` : "";
  return get<EnrollmentStats>(`/enrollments/stats${qs}`);
};

export const fetchConnectStatus = () => get<unknown>("/connect/status");

export const fetchBillingPlans = () => get<unknown>("/billing/plans");

export const fetchOwnerSales = (courseId?: string) => {
  const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return get<unknown[]>(`/payments/owner/sales${qs}`);
};
