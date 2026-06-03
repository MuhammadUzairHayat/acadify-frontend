"use client";

import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PortalPageHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <section className="relative border-b border-border-subtle overflow-hidden">
      <div className="absolute inset-0 home-grid-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-r from-background-primary via-transparent to-background-primary pointer-events-none" />

      <div className="relative px-6 md:px-8 pt-8 pb-6">
        <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-2">
          {eyebrow}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="animate-fade-in-delay text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="animate-fade-in-delay-2 text-sm text-text-secondary mt-1">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="animate-fade-in-delay-2 shrink-0">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
