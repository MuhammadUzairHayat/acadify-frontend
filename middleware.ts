import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getDashboardPathForRole,
  isRoleAllowedForPath,
  verifySessionToken,
} from "./lib/auth";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_PREFIXES = ["/student", "/owner", "/admin"];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session && isAuthRoute(pathname)) {
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(session.role), request.url),
    );
  }

  if (isProtectedRoute(pathname)) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isRoleAllowedForPath(session.role, pathname)) {
      return NextResponse.redirect(
        new URL(getDashboardPathForRole(session.role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/student/:path*",
    "/owner/:path*",
    "/admin/:path*",
  ],
};
