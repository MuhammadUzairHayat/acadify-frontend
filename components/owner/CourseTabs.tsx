"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { key: "content", label: "Content", href: "content" },
  { key: "settings", label: "Settings", href: "settings" },
  { key: "students", label: "Students", href: "students" },
  { key: "announcements", label: "Alerts", href: "announcements" },
];

export default function CourseTabs({ courseId }: { courseId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-t border-border-subtle overflow-x-auto -mx-1">
      {tabs.map((tab) => {
        const href = `/owner/courses/${courseId}/${tab.href}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              isActive
                ? "text-text-primary border-white/80"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
