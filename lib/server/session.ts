import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  getDashboardPathForRole,
  verifySessionToken,
  type Session,
} from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(
  roles?: UserRole | UserRole[],
): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(session.role)) {
      redirect(getDashboardPathForRole(session.role));
    }
  }
  return session;
}
