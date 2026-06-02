"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { key: "content", label: "Content", href: "content" },
  { key: "settings", label: "Settings", href: "settings" },
  { key: "students", label: "Students", href: "students" },
  { key: "announcements", label: "Announcements", href: "announcements" },
];

export default function CourseTabs({ courseId }: { courseId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const href = `/owner/courses/${courseId}/${tab.href}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              isActive
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
