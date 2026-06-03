import {
  CreateAcademyInput,
  CreateCourseInput,
  UpdateAcademyInput,
  UpdateCourseInput,
  RegisterInput,
  AcademyListItem,
  AcademyDetail,
  StudentDashboardData,
  StudentPlayData,
  StudentCourseEnrollment,
  StudentProfile,
  StudentCertificate,
  StudentNotification,
  Announcement,
  CourseDetail,
  CourseEnrollResult,
  CourseListItem,
  CourseReviewItem,
  PaymentIntentSession,
  PaymentStatusResult,
  CreateSectionDto,
  UpdateSectionDto,
  CreateLectureDto,
  UpdateLectureDto,
} from "./types";
import { apiFetch } from "./fetch-client";

const getErrorMessage = (data: unknown): string => {
  if (!data || typeof data !== "object") return "Something went wrong";
  const record = data as Record<string, unknown>;
  const message = record.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;
  if (typeof record.error === "string") return record.error;
  return "Something went wrong";
};

const unwrapData = <T>(data: unknown): T => {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
};

const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
      window.location.href = "/login";
    }
    throw new Error(getErrorMessage(data));
  }

  return data;
};

export const api = {
  // Academy endpoints
  academy: {
    create: async (data: CreateAcademyInput) => {
      const response = await apiFetch(`/academy`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getMy: async () => {
      const response = await apiFetch(`/academy/my-academy`, {
      });
      return handleResponse(response);
    },

    getStats: async () => {
      const response = await apiFetch(`/academy/my-stats`, {
      });
      return handleResponse(response);
    },

    update: async (data: UpdateAcademyInput) => {
      const response = await apiFetch(`/academy`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await apiFetch(`/academy/${id}`);
      return handleResponse(response);
    },

    getBySlug: async (slug: string) => {
      const response = await apiFetch(`/academy/slug/${slug}`);
      return handleResponse(response);
    },

    getAll: async (page = 1, limit = 20) => {
      const response = await apiFetch(
        `/academy?page=${page}&limit=${limit}`,
      );
      return handleResponse(response);
    },

    getMyPlan: async () => {
      const response = await apiFetch(`/academy/my-plan`, {
      });
      const data = await handleResponse(response);
      return unwrapData(data);
    },

    getCategories: async () => {
      const response = await apiFetch(`/academies/categories`);
      const data = await handleResponse(response);
      return unwrapData<{ id: string; name: string; slug: string }[]>(data);
    },

    browse: async (options?: {
      search?: string;
      category?: string;
      priceRange?: "free" | "under_50" | "50_100" | "100_plus";
      minRating?: number;
      sort?: "newest" | "most_courses" | "most_students" | "best_rated" | "most_reviewed";
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (options?.search) query.set("search", options.search);
      if (options?.category && options.category !== "All") {
        query.set("category", options.category);
      }
      if (options?.priceRange) query.set("priceRange", options.priceRange);
      if (options?.minRating) query.set("minRating", String(options.minRating));
      if (options?.sort) query.set("sort", options.sort);
      if (options?.page) query.set("page", String(options.page));
      if (options?.limit) query.set("limit", String(options.limit));

      const response = await apiFetch(
        `/academies${query.toString() ? `?${query.toString()}` : ""}`,
      );
      const data = await handleResponse(response);
      return unwrapData<{
        academies: AcademyListItem[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(data);
    },

    getTopRated: async (limit = 4) => {
      const response = await apiFetch(`/academies/top-rated?limit=${limit}`);
      const data = await handleResponse(response);
      return unwrapData<AcademyListItem[]>(data);
    },

    getPublicBySlug: async (slug: string) => {
      const response = await apiFetch(`/academies/${slug}`);
      const data = await handleResponse(response);
      return unwrapData<AcademyDetail>(data);
    },
  },

  // Course endpoints
  course: {
    create: async (data: CreateCourseInput) => {
      const response = await apiFetch(`/courses`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getMy: async () => {
      const response = await apiFetch(`/courses/my-courses`, {
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await apiFetch(`/courses/${id}`);
      return handleResponse(response);
    },

    update: async (id: string, data: UpdateCourseInput) => {
      const response = await apiFetch(`/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    publish: async (id: string) => {
      const response = await apiFetch(`/courses/${id}/publish`, {
        method: "POST",
      });
      return handleResponse(response);
    },

    unpublish: async (id: string) => {
      const response = await apiFetch(`/courses/${id}/unpublish`, {
        method: "POST",
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await apiFetch(`/courses/${id}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    },

    getStudents: async (
      id: string,
      options?: {
        search?: string;
        sortBy?: "name" | "enrollmentDate" | "completionPercent";
        sortOrder?: "asc" | "desc";
      },
    ) => {
      const query = new URLSearchParams();
      if (options?.search) query.set("search", options.search);
      if (options?.sortBy) query.set("sortBy", options.sortBy);
      if (options?.sortOrder) query.set("sortOrder", options.sortOrder);
      const queryString = query.toString();
      const response = await apiFetch(
        `/courses/${id}/students${queryString ? `?${queryString}` : ""}`,
        {
        },
      );
      return handleResponse(response);
    },

    enrollStudent: async (id: string, email: string) => {
      const response = await apiFetch(`/courses/${id}/students`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    removeStudent: async (id: string, enrollmentId: string) => {
      const response = await apiFetch(
        `/courses/${id}/students/${enrollmentId}`,
        {
          method: "DELETE",
        },
      );
      return handleResponse(response);
    },

    getAnnouncements: async (id: string, search?: string) => {
      const query = new URLSearchParams();
      if (search?.trim()) query.set("search", search.trim());
      const response = await apiFetch(
        `/courses/${id}/announcements${query.toString() ? `?${query.toString()}` : ""}`,
        {},
      );
      return handleResponse(response) as Promise<Announcement[]>;
    },

    createAnnouncement: async (
      id: string,
      payload: { title: string; message: string; isImportant?: boolean },
    ) => {
      const response = await apiFetch(`/courses/${id}/announcements`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return handleResponse(response) as Promise<Announcement>;
    },

    updateAnnouncement: async (
      id: string,
      announcementId: string,
      payload: { title?: string; message?: string; isImportant?: boolean },
    ) => {
      const response = await apiFetch(
        `/courses/${id}/announcements/${announcementId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      return handleResponse(response) as Promise<Announcement>;
    },

    deleteAnnouncement: async (id: string, announcementId: string) => {
      const response = await apiFetch(
        `/courses/${id}/announcements/${announcementId}`,
        {
          method: "DELETE",
        },
      );
      return handleResponse(response);
    },

    getAll: async (page = 1, limit = 20, category?: string, level?: string) => {
      let url = `/courses?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (level) url += `&level=${level}`;
      const response = await apiFetch(url);
      return handleResponse(response);
    },
  },

  coursePublic: {
    getCategories: async () => {
      const response = await apiFetch(`/courses/categories`);
      const data = await handleResponse(response);
      return unwrapData<{ id: string; name: string; slug: string }[]>(data);
    },

    getAcademies: async () => {
      const response = await apiFetch(`/courses/academies`);
      const data = await handleResponse(response);
      return unwrapData<{ id: string; name: string; slug: string }[]>(data);
    },

    getTrending: async (limit = 3) => {
      const response = await apiFetch(`/courses/trending?limit=${limit}`);
      const data = await handleResponse(response);
      return unwrapData<CourseListItem[]>(data);
    },

    getFeatured: async (limit = 6) => {
      const response = await apiFetch(`/courses/featured?limit=${limit}`);
      const data = await handleResponse(response);
      return unwrapData<CourseListItem[]>(data);
    },

    getNew: async (limit = 6) => {
      const response = await apiFetch(`/courses/new?limit=${limit}`);
      const data = await handleResponse(response);
      return unwrapData<CourseListItem[]>(data);
    },

    getFree: async (limit = 6) => {
      const response = await apiFetch(`/courses/free?limit=${limit}`);
      const data = await handleResponse(response);
      return unwrapData<CourseListItem[]>(data);
    },

    browse: async (options?: {
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
    }) => {
      const query = new URLSearchParams();
      if (options?.search) query.set("search", options.search);
      if (options?.category && options.category !== "All") {
        query.set("category", options.category);
      }
      if (options?.subcategory) query.set("subcategory", options.subcategory);
      if (options?.level && options.level !== "All") query.set("level", options.level);
      if (options?.priceRange) query.set("priceRange", options.priceRange);
      if (options?.minRating) query.set("minRating", String(options.minRating));
      if (options?.academyId) query.set("academyId", options.academyId);
      if (options?.sort) query.set("sort", options.sort);
      if (options?.page) query.set("page", String(options.page));
      if (options?.limit) query.set("limit", String(options.limit));

      const response = await apiFetch(
        `/courses/browse${query.toString() ? `?${query.toString()}` : ""}`,
      );
      const data = await handleResponse(response);
      return unwrapData<{
        courses: CourseListItem[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(data);
    },

    getBySlug: async (slug: string) => {
      const response = await apiFetch(`/courses/by-slug/${slug}`, {
      });
      const data = await handleResponse(response);
      return unwrapData<CourseDetail>(data);
    },

    getReviews: async (slug: string, page = 1, limit = 10) => {
      const response = await apiFetch(
        `/courses/by-slug/${slug}/reviews?page=${page}&limit=${limit}`,
      );
      const data = await handleResponse(response);
      return unwrapData<{
        reviews: CourseReviewItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(data);
    },
  },

  connect: {
    getStatus: async () => {
      const response = await apiFetch(`/connect/status`, {
      });
      const data = await handleResponse(response);
      return unwrapData<{
        accountId: string | null;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        onboardingComplete: boolean;
        canAcceptPayments: boolean;
        platformCoversConnectFee: boolean;
      }>(data);
    },

    startOnboarding: async () => {
      const response = await apiFetch(`/connect/onboarding`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<{ url: string; accountId: string }>(data);
    },

    openDashboard: async () => {
      const response = await apiFetch(`/connect/dashboard`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<{ url: string }>(data);
    },
  },

  billing: {
    getPlans: async () => {
      const response = await apiFetch(`/billing/plans`, {
      });
      const data = await handleResponse(response);
      return unwrapData(data);
    },

    upgrade: async (planTier: string, interval: "month" | "year") => {
      const response = await apiFetch(`/billing/upgrade`, {
        method: "POST",
        body: JSON.stringify({ planTier, interval }),
      });
      const data = await handleResponse(response);
      return unwrapData<{ checkoutUrl: string }>(data);
    },

    cancel: async () => {
      const response = await apiFetch(`/billing/cancel`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<{ cancelAtPeriodEnd: boolean; currentPeriodEnd: string | null }>(
        data,
      );
    },

    enterpriseInquiry: async (payload: { message: string; companyName?: string }) => {
      const response = await apiFetch(`/billing/enterprise-inquiry`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(response);
      return unwrapData<{ submitted: boolean }>(data);
    },
  },

  ownerPayments: {
    listSales: async (courseId?: string) => {
      const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
      const response = await apiFetch(`/payments/owner/sales${query}`, {
      });
      const data = await handleResponse(response);
      return unwrapData<
        Array<{
          id: string;
          amount: number;
          amountCents: number;
          status: string;
          refundStatus: string;
          createdAt: string;
          student: { name: string; email: string };
          course: { id: string; title: string };
          enrollment: { id: string; status: string } | null;
        }>
      >(data);
    },

    refund: async (paymentId: string) => {
      const response = await apiFetch(`/payments/owner/${paymentId}/refund`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<{
        refundId: string;
        status: string;
        amountCents: number;
        isFullRefund: boolean;
        courseTitle: string;
      }>(data);
    },

    getRevenueAnalytics: async (period: "day" | "week" | "month" | "year") => {
      const response = await apiFetch(
        `/payments/owner/analytics?period=${period}`,
      );
      const data = await handleResponse(response);
      return unwrapData<{
        period: string;
        summary: {
          totalGross: number;
          totalPlatformFees: number;
          totalOwnerNet: number;
          totalSales: number;
        };
        chart: Array<{ period: string; sales: number; gross: number }>;
        recentSales: Array<{
          gross: number;
          platformFee: number;
          ownerNet: number;
          date: string;
        }>;
      }>(data);
    },
  },

  admin: {
    listAcademies: async () => {
      const response = await apiFetch(`/admin/academies`);
      const data = await handleResponse(response);
      return unwrapData<
        Array<{
          id: string;
          name: string;
          owner: { id: string; email: string; name: string };
          subscription: {
            plan: { tier: string; name: string };
          } | null;
          _count: { courses: number };
        }>
      >(data);
    },

    getStats: async () => {
      const response = await apiFetch(`/admin/stats`);
      const data = await handleResponse(response);
      return unwrapData<Array<{ plan: string | null; count: number }>>(data);
    },

    assignEnterprise: async (
      academyId: string,
      payload: {
        maxCourses?: number;
        maxStudents?: number;
        storageGB?: number;
      },
    ) => {
      const response = await apiFetch(
        `/admin/academies/${academyId}/assign-enterprise`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      const data = await handleResponse(response);
      return unwrapData(data);
    },
  },

  payments: {
    createIntent: async (courseId: string) => {
      const response = await apiFetch(`/payments/courses/${courseId}/intent`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<PaymentIntentSession>(data);
    },

    getStatus: async (paymentId: string) => {
      const response = await apiFetch(`/payments/${paymentId}/status`, {
      });
      const data = await handleResponse(response);
      return unwrapData<PaymentStatusResult>(data);
    },
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiFetch(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (data: RegisterInput) => {
      const response = await apiFetch(`/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getProfile: async () => {
      const response = await apiFetch(`/auth/profile`, {
      });
      return handleResponse(response);
    },

    logout: async (redirectTo?: string) => {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
      if (redirectTo && typeof window !== "undefined") {
        window.location.assign(redirectTo);
      }
    },
  },
  // Add to existing api object

  section: {
    create: async (courseId: string, data: CreateSectionDto) => {
      const response = await apiFetch(`/courses/${courseId}/sections`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getByCourse: async (courseId: string) => {
      const response = await apiFetch(`/courses/${courseId}/sections`);
      return handleResponse(response);
    },

    getById: async (courseId: string, sectionId: string) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}`,
      );
      return handleResponse(response);
    },

    update: async (courseId: string, sectionId: string, data: UpdateSectionDto) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },

    delete: async (courseId: string, sectionId: string) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}`,
        {
          method: "DELETE",
        },
      );
      return handleResponse(response);
    },

    reorder: async (
      courseId: string,
      sections: { id: string; order: number }[],
    ) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/reorder`,
        {
          method: "POST",
          body: JSON.stringify({ sections }),
        },
      );
      return handleResponse(response);
    },
  },

  lecture: {
    create: async (courseId: string, sectionId: string, data: CreateLectureDto) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}/lectures`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },

    getById: async (lectureId: string) => {
      const response = await apiFetch(`/courses/lectures/${lectureId}`);
      return handleResponse(response);
    },

    update: async (
      courseId: string,
      sectionId: string,
      lectureId: string,
      data: UpdateLectureDto,
    ) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },

    delete: async (courseId: string, sectionId: string, lectureId: string) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
        {
          method: "DELETE",
        },
      );
      return handleResponse(response);
    },

    reorder: async (
      courseId: string,
      sectionId: string,
      lectures: { id: string; order: number }[],
    ) => {
      const response = await apiFetch(
        `/courses/${courseId}/sections/${sectionId}/lectures/reorder`,
        {
          method: "POST",
          body: JSON.stringify({ lectures }),
        },
      );
      return handleResponse(response);
    },

    getCourseContent: async (courseId: string) => {
      const response = await apiFetch(`/courses/${courseId}/content`, {
      });
      return handleResponse(response);
    },
  },

  enrollment: {
    getStats: async (options?: { courseId?: string }) => {
      const query = new URLSearchParams();
      if (options?.courseId) query.set("courseId", options.courseId);
      const response = await apiFetch(
        `/enrollments/stats${query.toString() ? `?${query.toString()}` : ""}`,
        {},
      );
      return handleResponse(response);
    },

    list: async (options?: {
      page?: number;
      limit?: number;
      search?: string;
      courseId?: string;
      status?: string;
      from?: string;
      to?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const query = new URLSearchParams();
      if (options?.page) query.set("page", String(options.page));
      if (options?.limit) query.set("limit", String(options.limit));
      if (options?.search) query.set("search", options.search);
      if (options?.courseId) query.set("courseId", options.courseId);
      if (options?.status) query.set("status", options.status);
      if (options?.from) query.set("from", options.from);
      if (options?.to) query.set("to", options.to);
      if (options?.sortBy) query.set("sortBy", options.sortBy);
      if (options?.sortOrder) query.set("sortOrder", options.sortOrder);

      const response = await apiFetch(
        `/enrollments${query.toString() ? `?${query.toString()}` : ""}`,
        {},
      );
      return handleResponse(response);
    },

    getById: async (enrollmentId: string) => {
      const response = await apiFetch(`/enrollments/${enrollmentId}`, {
      });
      return handleResponse(response);
    },

    manualEnroll: async (payload: {
      courseId: string;
      studentEmail: string;
      status?: string;
      amountPaid?: number;
      currency?: string;
    }) => {
      const response = await apiFetch(`/enrollments/manual`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return handleResponse(response);
    },

    bulkEnroll: async (payload: { courseId: string; studentEmails: string; status?: string }) => {
      const response = await apiFetch(`/enrollments/bulk`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return handleResponse(response);
    },

    remove: async (enrollmentId: string) => {
      const response = await apiFetch(`/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    },
  },

  student: {
    getDashboard: async () => {
      const response = await apiFetch(`/student/dashboard`, {
      });
      return handleResponse(response) as Promise<StudentDashboardData>;
    },

    getCourses: async (options?: {
      status?: "ALL" | "IN_PROGRESS" | "COMPLETED";
      search?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (options?.status) query.set("status", options.status);
      if (options?.search) query.set("search", options.search);
      if (options?.page) query.set("page", String(options.page));
      if (options?.limit) query.set("limit", String(options.limit));

      const response = await apiFetch(
        `/student/courses${query.toString() ? `?${query.toString()}` : ""}`,
        {
        },
      );
      return handleResponse(response) as Promise<{
        courses: StudentCourseEnrollment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>;
    },

    getCoursePlayer: async (courseId: string) => {
      const response = await apiFetch(`/student/courses/${courseId}/play`, {
      });
      return handleResponse(response) as Promise<StudentPlayData>;
    },

    updateLectureProgress: async (
      courseId: string,
      lectureId: string,
      payload: {
        watchTime?: number;
        lastPosition?: number;
        completed?: boolean;
      },
    ) => {
      const response = await apiFetch(
        `/student/courses/${courseId}/lectures/${lectureId}/progress`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return handleResponse(response);
    },

    getCourseProgress: async (courseId: string) => {
      const response = await apiFetch(`/student/courses/${courseId}/progress`, {
      });
      return handleResponse(response);
    },

    enroll: async (courseId: string) => {
      const response = await apiFetch(`/student/courses/${courseId}/enroll`, {
        method: "POST",
      });
      const data = await handleResponse(response);
      return unwrapData<CourseEnrollResult>(data);
    },

    addToWishlist: async (courseId: string) => {
      const response = await apiFetch(`/student/wishlist/${courseId}`, {
        method: "POST",
      });
      return handleResponse(response);
    },

    removeFromWishlist: async (courseId: string) => {
      const response = await apiFetch(`/student/wishlist/${courseId}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    },

    getProfile: async () => {
      const response = await apiFetch(`/student/profile`, {
      });
      const data = await handleResponse(response);
      return unwrapData<StudentProfile>(data);
    },

    updateProfile: async (payload: {
      name?: string;
      bio?: string;
      avatarUrl?: string;
      skills?: string[];
      preferences?: Record<string, unknown>;
    }) => {
      const response = await apiFetch(`/student/profile`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(response);
      return unwrapData<StudentProfile>(data);
    },

    getCertificates: async () => {
      const response = await apiFetch(`/student/certificates`, {
      });
      const data = await handleResponse(response);
      return unwrapData<StudentCertificate[]>(data);
    },

    getCertificate: async (certificateId: string) => {
      const response = await apiFetch(`/student/certificates/${certificateId}`, {
      });
      const data = await handleResponse(response);
      return unwrapData<StudentCertificate & { studentName: string; courseTitle: string }>(
        data,
      );
    },

    downloadCertificate: async (certificateId: string) => {
      const response = await apiFetch(
        `/student/certificates/${certificateId}/download`,
        {},
      );
      const data = await handleResponse(response);
      return unwrapData<{
        certificateId: string;
        verifyUrl: string;
        viewUrl: string;
        studentName: string;
        courseTitle: string;
        issuedAt: string;
      }>(data);
    },

    generateCertificate: async (courseId: string) => {
      const response = await apiFetch(`/student/courses/${courseId}/certificate/generate`, {
        method: "POST",
      });
      return handleResponse(response);
    },

    getNotifications: async (options?: {
      isRead?: "true" | "false";
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (options?.isRead) query.set("isRead", options.isRead);
      if (options?.page) query.set("page", String(options.page));
      if (options?.limit) query.set("limit", String(options.limit));
      const response = await apiFetch(
        `/student/notifications${query.toString() ? `?${query.toString()}` : ""}`,
        {
        },
      );
      const data = await handleResponse(response);
      return unwrapData<{
        notifications: StudentNotification[];
        unreadCount: number;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(data);
    },

    markNotificationRead: async (id: string) => {
      const response = await apiFetch(`/student/notifications/${id}/read`, {
        method: "PUT",
      });
      return handleResponse(response);
    },

    deleteNotification: async (id: string) => {
      const response = await apiFetch(`/student/notifications/${id}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    },

    submitCourseReview: async (
      courseId: string,
      payload: { rating: number; comment?: string },
    ) => {
      const response = await apiFetch(`/student/courses/${courseId}/reviews`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(response);
      return unwrapData(data);
    },
  },
};
