export type UserRole = "STUDENT" | "OWNER" | "ADMIN";

export type CreateAcademyInput = {
  name: string;
  description: string;
  city: string;
  address?: string;
  logo?: string;
  banner?: string;
};

export type UpdateAcademyInput = Partial<CreateAcademyInput>;

export type CreateCourseInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  thumbnail?: string;
  isPublished?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  currency?: string;
  tags?: string[];
  whatYouWillLearn?: string;
  targetAudience?: string;
  requirements?: string;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

export type Announcement = {
  id: string;
  title: string;
  message: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'OWNER' | 'ADMIN';
};

export type User = {
  userId?: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'OWNER' | 'ADMIN';
};

export type Enrollment = {
  id: string;
  enrolledAt: string;
  progressPercent?: number;
  lastActivityAt?: string | null;
  completedAt?: string | null;
  status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DROPPED" | "REFUNDED";
  student: { name: string; email: string };
  // optional: payment info, status, etc. kept open for backend extensions
  [key: string]: unknown;
};

export type EnrollmentStats = {
  totalEnrollments: number;
  activeStudents: number;
  completed: number;
  totalRevenue: number;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  level?: string;
  isPublished?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnail?: string | null;
  currency?: string;
  tags?: string[];
  whatYouWillLearn?: string | null;
  targetAudience?: string | null;
  requirements?: string | null;
  _count?: {
    enrollments: number;
  };
  enrollments?: Enrollment[];
  // allow extra fields returned by the API
  [key: string]: unknown;
};


export interface Academy {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  address: string | null;
  logo: string | null;
  banner: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export type AcademyListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  city: string;
  isVerified: boolean;
  createdAt: string;
  courseCount: number;
  studentCount: number;
  reviewCount: number;
  averageRating: number;
  categories: string[];
  specialties: string[];
  priceRange: { min: number; max: number; avg: number };
  isNew?: boolean;
};

export type AcademyReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  studentName: string;
  courseTitle: string;
};

export type AcademyDetail = AcademyListItem & {
  address?: string | null;
  ownerName?: string;
  popularCourses: {
    id: string;
    title: string;
    description?: string;
    category: string;
    price: number;
    thumbnail: string | null;
    level?: string;
    studentCount: number;
    averageRating: number;
    reviewCount: number;
  }[];
  ratingDistribution: Record<string, number>;
  recentReviews: AcademyReview[];
};

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string;
  thumbnail?: string | null;
  previewVideoUrl?: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  category: string;
  subcategory?: string | null;
  level: string;
  totalLectures: number;
  totalDuration: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew?: boolean;
  publishedAt?: string | null;
  badge?: "trending" | "popular" | "featured" | "new" | "free";
  academy: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  instructor: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  tags: string[];
};

export type CourseReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  studentName: string;
  studentAvatar?: string | null;
};

export type CourseDetail = CourseListItem & {
  whatYouWillLearn?: string[] | null;
  requirements?: string[] | null;
  targetAudience?: string[] | null;
  totalSections: number;
  curriculum: {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    lectureCount: number;
    durationMinutes: number;
    lectures: {
      id: string;
      title: string;
      duration?: number | null;
      isFree: boolean;
      order: number;
      isLocked: boolean;
    }[];
  }[];
  ratingDistribution: Record<string, number>;
  recentReviews: CourseReviewItem[];
  isEnrolled: boolean;
  isWishlisted: boolean;
  instructor: CourseListItem["instructor"] & {
    bio?: string | null;
    otherCourses: {
      id: string;
      slug: string;
      title: string;
      averageRating: number;
      price: number;
      thumbnail?: string | null;
    }[];
  };
};

export type CourseEnrollResult = {
  enrolled: boolean;
  alreadyEnrolled?: boolean;
  requiresPayment?: boolean;
  courseId: string;
  slug: string;
  price?: number;
  currency?: string;
  playUrl?: string;
};

export type PaymentIntentSession = {
  paymentId: string;
  clientSecret: string;
  publishableKey: string;
  stripeAccountId: string;
  amount: number;
  currency: string;
  courseTitle: string;
};

export type PaymentStatusResult = {
  paymentId: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "DISPUTED" | "EXPIRED";
  enrolled: boolean;
  playUrl: string | null;
  courseSlug: string;
  courseTitle: string;
};

// ============ SECTION TYPES ============

export interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lectures?: Lecture[];
}

export interface CreateSectionDto {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateSectionDto {
  title?: string;
  description?: string;
  order?: number;
}

export interface SectionReorderDto {
  sections: {
    id: string;
    order: number;
  }[];
}

// ============ LECTURE TYPES ============

export interface Lecture {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  resourceUrl: string | null;
  duration: number | null;
  isFree: boolean;
  order: number;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLectureDto {
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  resourceUrl?: string;
  duration?: number;
  isFree?: boolean;
  order: number;
}

export interface UpdateLectureDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  resourceUrl?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface LectureReorderDto {
  lectures: {
    id: string;
    order: number;
  }[];
}

// ============ COURSE CONTENT TYPES ============

export interface CourseContent {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    price: number;
    category: string;
    level: string;
    isPublished: boolean;
    academy: {
      id: string;
      name: string;
      slug: string;
    };
    instructor: {
      id: string;
      name: string;
    };
  };
  sections: Section[];
  isEnrolled: boolean;
}

export type StudentCourseEnrollment = {
  id: string;
  progressPercent: number;
  totalWatchTime: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DROPPED" | "REFUNDED";
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  course: {
    id: string;
    title: string;
    thumbnail?: string | null;
    instructor?: {
      id: string;
      name: string;
    } | null;
  };
};

export type StudentDashboardData = {
  enrolledCount: number;
  inProgressCount: number;
  completedCount: number;
  totalHours: number;
  continueLearning: StudentCourseEnrollment[];
  recentCompleted: StudentCourseEnrollment[];
};

export type StudentPlayData = {
  course: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
  };
  sections: Section[];
  currentProgress: {
    overallProgress: number;
    totalWatchTime: number;
    lastLectureId?: string | null;
  };
  watchHistory: {
    lectureId: string;
    completed: boolean;
    watchTime: number;
    lastPosition: number;
  }[];
};

export type StudentProfile = {
  name: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  skills: string[];
  preferences: Record<string, unknown>;
};

export type StudentCertificate = {
  id: string;
  certificateId: string;
  certificateUrl: string;
  issuedAt: string;
  downloadedAt?: string | null;
  completionDate?: string | null;
  studentName?: string;
  courseTitle?: string;
  course: {
    id: string;
    title: string;
    thumbnail?: string | null;
  };
};

export type StudentNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};
