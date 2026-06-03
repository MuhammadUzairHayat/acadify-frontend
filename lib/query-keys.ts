export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  courses: {
    all: ["courses"] as const,
    browse: (filters: Record<string, unknown>) =>
      ["courses", "browse", filters] as const,
    detail: (slug: string) => ["courses", "detail", slug] as const,
    categories: ["courses", "categories"] as const,
    filterAcademies: ["courses", "filter-academies"] as const,
    trending: (limit: number) => ["courses", "trending", limit] as const,
    featured: (limit: number) => ["courses", "featured", limit] as const,
    new: (limit: number) => ["courses", "new", limit] as const,
    free: (limit: number) => ["courses", "free", limit] as const,
    owner: {
      all: ["courses", "owner"] as const,
      detail: (id: string) => ["courses", "owner", id] as const,
      sections: (id: string) => ["courses", "owner", id, "sections"] as const,
      students: (id: string, filters: Record<string, unknown>) =>
        ["courses", "owner", id, "students", filters] as const,
      announcements: (id: string, search?: string) =>
        ["courses", "owner", id, "announcements", search ?? ""] as const,
    },
  },
  academies: {
    all: ["academies"] as const,
    browse: (filters: Record<string, unknown>) =>
      ["academies", "browse", filters] as const,
    topRated: (limit: number) => ["academies", "top-rated", limit] as const,
    categories: ["academies", "categories"] as const,
    detail: (slug: string) => ["academies", "detail", slug] as const,
    my: ["academies", "my"] as const,
    stats: ["academies", "stats"] as const,
  },
  enrollments: {
    all: ["enrollments"] as const,
    list: (filters: Record<string, unknown>) =>
      ["enrollments", "list", filters] as const,
    detail: (id: string) => ["enrollments", "detail", id] as const,
    stats: (courseId?: string) =>
      ["enrollments", "stats", courseId ?? "all"] as const,
    courses: ["enrollments", "courses"] as const,
    recent: (limit: number) => ["enrollments", "recent", limit] as const,
  },
  student: {
    dashboard: ["student", "dashboard"] as const,
    courses: (filters: Record<string, unknown>) =>
      ["student", "courses", filters] as const,
    player: (courseId: string) => ["student", "player", courseId] as const,
    profile: ["student", "profile"] as const,
    notifications: (filters: Record<string, unknown>) =>
      ["student", "notifications", filters] as const,
    certificates: ["student", "certificates"] as const,
    certificate: (id: string) => ["student", "certificate", id] as const,
  },
  billing: {
    connect: ["billing", "connect"] as const,
    plans: ["billing", "plans"] as const,
    subscription: ["billing", "subscription"] as const,
    sales: (courseId?: string) =>
      ["billing", "sales", courseId ?? "all"] as const,
    analytics: (period: string) => ["billing", "analytics", period] as const,
  },
  admin: {
    academies: ["admin", "academies"] as const,
    stats: ["admin", "stats"] as const,
  },
} as const;

export const STALE_TIMES = {
  browse: 2 * 60 * 1000,
  categories: 10 * 60 * 1000,
  topRated: 5 * 60 * 1000,
  detail: 5 * 60 * 1000,
  enrollments: 60 * 1000,
  stats: 60 * 1000,
  profile: 5 * 60 * 1000,
  dashboard: 60 * 1000,
  owner: 60 * 1000,
  billing: 2 * 60 * 1000,
} as const;
