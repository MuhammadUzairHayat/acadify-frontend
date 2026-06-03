"use client";

import { api } from "@/lib/apis";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/student/dashboard" },
  { name: "Courses", href: "/student/courses" },
  { name: "Certificates", href: "/student/certificates" },
  { name: "Alerts", href: "/student/notifications" },
  { name: "Profile", href: "/student/profile" },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    void api.auth.logout("/login");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface/95 backdrop-blur-xl border-r border-border-subtle flex flex-col z-40">
      <div className="p-5 border-b border-border-subtle">
        <Link href="/student/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
            <span className="text-text-inverse font-bold text-lg">A</span>
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">Acadify</span>
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-tertiary mt-3">
          Student
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-white/10 text-text-primary"
                : "text-text-secondary hover:bg-background-hover hover:text-text-primary"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border-subtle">
        <Link
          href="/courses"
          className="block w-full text-center text-xs text-text-tertiary hover:text-text-secondary py-2 mb-1 transition-colors"
        >
          Browse catalog
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
