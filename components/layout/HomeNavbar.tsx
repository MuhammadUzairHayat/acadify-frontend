"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apis";
import { getDashboardPathForRole } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

type NavUser = { name: string; role: UserRole };

export function HomeNavbar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    api.auth
      .getProfile()
      .then((res) => {
        const profileUser = res.data?.user;
        if (profileUser) {
          setUser({
            name: profileUser.name,
            role: profileUser.role as UserRole,
          });
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    void api.auth.logout("/");
  };

  const dashboardHref = user ? getDashboardPathForRole(user.role) : "/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-text-inverse font-bold text-lg">A</span>
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">Acadify</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/academies"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Academies
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Dashboard
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary px-2 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-lg">Get started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle">
            <div className="flex flex-col gap-3">
              <Link href="/courses" className="text-sm font-medium text-text-secondary py-1">
                Courses
              </Link>
              <Link href="/academies" className="text-sm font-medium text-text-secondary py-1">
                Academies
              </Link>
              {user ? (
                <>
                  <Link href={dashboardHref} className="text-sm font-medium py-1">Dashboard</Link>
                  <button type="button" onClick={handleLogout} className="text-sm font-medium text-left py-1">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" fullWidth>Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" fullWidth>Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
