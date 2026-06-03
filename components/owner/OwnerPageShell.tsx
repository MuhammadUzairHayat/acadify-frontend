"use client";

import type { ReactNode } from "react";
import { PortalPageHeader } from "@/components/ui/PortalPageHeader";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export function OwnerPageShell({
  eyebrow,
  title,
  subtitle,
  action,
  children,
  contentClassName = "",
}: Props) {
  return (
    <div className="min-h-screen">
      <PortalPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} action={action} />
      <div className={`px-6 md:px-8 py-8 ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
}
