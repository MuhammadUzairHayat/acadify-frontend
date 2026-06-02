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
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

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
  student: { name: string; email: string };
  // optional: payment info, status, etc. kept open for backend extensions
  [key: string]: unknown;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  level?: string;
  isPublished?: boolean;
  thumbnail?: string | null;
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
