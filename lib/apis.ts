import { CreateAcademyInput, CreateCourseInput, UpdateAcademyInput, UpdateCourseInput, RegisterInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
};

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  // Academy endpoints
  academy: {
    create: async (data: CreateAcademyInput) => {
      const response = await fetch(`${API_URL}/academy`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getMy: async () => {
      const response = await fetch(`${API_URL}/academy/my-academy`, {
        headers: headers(),
      });
      return handleResponse(response);
    },

    getStats: async () => {
      const response = await fetch(`${API_URL}/academy/my-stats`, {
        headers: headers(),
      });
      return handleResponse(response);
    },

    update: async (data: UpdateAcademyInput) => {
      const response = await fetch(`${API_URL}/academy`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/academy/${id}`);
      return handleResponse(response);
    },

    getBySlug: async (slug: string) => {
      const response = await fetch(`${API_URL}/academy/slug/${slug}`);
      return handleResponse(response);
    },

    getAll: async (page = 1, limit = 20) => {
      const response = await fetch(
        `${API_URL}/academy?page=${page}&limit=${limit}`,
      );
      return handleResponse(response);
    },
  },

  // Course endpoints
  course: {
    create: async (data: CreateCourseInput) => {
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getMy: async () => {
      const response = await fetch(`${API_URL}/courses/my-courses`, {
        headers: headers(),
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/courses/${id}`);
      return handleResponse(response);
    },

    update: async (id: string, data: UpdateCourseInput) => {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    publish: async (id: string) => {
      const response = await fetch(`${API_URL}/courses/${id}/publish`, {
        method: "POST",
        headers: headers(),
      });
      return handleResponse(response);
    },

    unpublish: async (id: string) => {
      const response = await fetch(`${API_URL}/courses/${id}/unpublish`, {
        method: "POST",
        headers: headers(),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      return handleResponse(response);
    },

    getStudents: async (id: string) => {
      const response = await fetch(`${API_URL}/courses/${id}/students`, {
        headers: headers(),
      });
      return handleResponse(response);
    },

    getAll: async (page = 1, limit = 20, category?: string, level?: string) => {
      let url = `${API_URL}/courses?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (level) url += `&level=${level}`;
      const response = await fetch(url);
      return handleResponse(response);
    },
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (data: RegisterInput) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getProfile: async () => {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: headers(),
      });
      return handleResponse(response);
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
};
