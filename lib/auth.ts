import { jwtVerify } from "jose";
import type { UserRole } from "./types";

export const AUTH_COOKIE_NAME = "access_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "OWNER":
      return "/owner/dashboard";
    case "STUDENT":
    default:
      return "/student/dashboard";
  }
}

export function isRoleAllowedForPath(
  role: UserRole,
  pathname: string,
): boolean {
  if (pathname.startsWith("/student")) return role === "STUDENT";
  if (pathname.startsWith("/owner")) return role === "OWNER";
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  return true;
}

export function resolvePostLoginPath(
  role: UserRole,
  redirectParam: string | null,
): string {
  if (redirectParam) {
    const decoded = decodeURIComponent(redirectParam);
    if (decoded.startsWith("/student") && role !== "STUDENT") {
      return getDashboardPathForRole(role);
    }
    if (decoded.startsWith("/owner") && role !== "OWNER") {
      return getDashboardPathForRole(role);
    }
    if (decoded.startsWith("/admin") && role !== "ADMIN") {
      return getDashboardPathForRole(role);
    }
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  }
  return getDashboardPathForRole(role);
}

export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const role = payload.role as UserRole;
    const sub = payload.sub as string;
    const email = payload.email as string;
    const name = payload.name as string;

    if (!sub || !role) return null;

    return { userId: sub, email, name, role };
  } catch {
    return null;
  }
}
