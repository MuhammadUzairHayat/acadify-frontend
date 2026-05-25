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
