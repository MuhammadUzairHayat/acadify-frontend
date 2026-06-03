"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useMyAcademy } from "@/hooks/useOwner";
import { Academy } from "@/lib/types";

export function OwnerAcademyPageClient() {
  const { data: academy, isLoading, isError, error } = useMyAcademy();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const academyData = academy as Academy | null | undefined;
  const notFound =
    !academyData ||
    (isError && error instanceof Error && error.message.includes("Academy not found"));

  if (notFound) {
    return (
      <OwnerPageShell eyebrow="Institution" title="Academy" subtitle="Set up your brand.">
        <RevealOnScroll>
          <Card padding="lg" className="max-w-lg mx-auto border-border-subtle bg-surface/40 text-center py-12">
            <h2 className="text-lg font-bold text-text-primary mb-2">No academy yet</h2>
            <p className="text-sm text-text-secondary mb-6">Create one to start offering courses.</p>
            <Link href="/owner/academy/edit">
              <Button className="rounded-xl">Create academy</Button>
            </Link>
          </Card>
        </RevealOnScroll>
      </OwnerPageShell>
    );
  }

  return (
    <OwnerPageShell
      eyebrow="Institution"
      title={academyData.name}
      subtitle={academyData.city || "Your academy"}
      action={
        <Link href="/owner/academy/edit">
          <Button variant="outline" size="sm" className="rounded-xl">Edit</Button>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <RevealOnScroll>
          <div className="relative h-40 rounded-2xl overflow-hidden border border-border-subtle bg-surface/60">
            {academyData.banner ? (
              <OptimizedImage
                src={academyData.banner}
                alt=""
                fill
                className="object-cover opacity-60"
                sizes="800px"
              />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-background-primary via-background-primary/40 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-end gap-4">
              <div className="w-16 h-16 rounded-xl border border-border-subtle bg-surface overflow-hidden relative shrink-0">
                {academyData.logo ? (
                  <OptimizedImage
                    src={academyData.logo}
                    alt={academyData.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
                    Logo
                  </div>
                )}
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealGroup className="grid md:grid-cols-2 gap-4" stagger={90}>
          <RevealItem index={0}>
            <Card padding="lg" className="border-border-subtle bg-surface/40 h-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-3">About</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {academyData.description || "No description."}
              </p>
              <p className="text-xs text-text-tertiary mt-4">{academyData.address || "No address."}</p>
              <p className="text-xs font-mono text-text-tertiary mt-2">/academies/{academyData.slug}</p>
            </Card>
          </RevealItem>
          <RevealItem index={1}>
            <Card padding="lg" className="border-border-subtle bg-surface/40 h-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-3">Status</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Verified</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      academyData.isVerified
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {academyData.isVerified ? "Yes" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Approved</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      academyData.isApproved
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {academyData.isApproved ? "Yes" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary pt-2">
                  Created {new Date(academyData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          </RevealItem>
        </RevealGroup>

        <RevealOnScroll delay={80}>
          <Card padding="lg" className="border-border-subtle bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-text-primary text-sm">Public page</p>
              <p className="text-xs text-text-tertiary mt-0.5">Preview your live profile</p>
            </div>
            <Link href={`/academies/${academyData.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl">
                View page
              </Button>
            </Link>
          </Card>
        </RevealOnScroll>
      </div>
    </OwnerPageShell>
  );
}
