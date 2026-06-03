import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { AcademyListItem } from "@/lib/types";
import {
  IconBook,
  IconBuilding,
  IconCurrency,
  IconGraduation,
  IconUsers,
  StarRatingDisplay,
} from "./AcademyIcons";

function formatStudents(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function formatPriceRange(priceRange: AcademyListItem["priceRange"]) {
  if (priceRange.max === 0) return "Free courses";
  if (priceRange.min === priceRange.max) return `$${priceRange.min}/course`;
  return `$${priceRange.min} – $${priceRange.max}/course`;
}

function AcademyLogo({
  academy,
  className = "w-16 h-16",
}: {
  academy: AcademyListItem;
  className?: string;
}) {
  return (
    <div
      className={`${className} bg-accent/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative`}
    >
      {academy.logo ? (
        <OptimizedImage src={academy.logo} alt={academy.name} fill className="object-cover" sizes="64px" />
      ) : (
        <IconBuilding className="h-8 w-8 text-accent" />
      )}
    </div>
  );
}

export function AcademyCard({ academy, compact = false }: { academy: AcademyListItem; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/academies/${academy.slug}`}>
        <Card className="text-center hover:border-accent/30 transition-all h-full">
          <div className="w-16 h-16 mx-auto mb-3">
            <AcademyLogo academy={academy} />
          </div>
          <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{academy.name}</h3>
          <StarRatingDisplay rating={academy.averageRating} reviewCount={academy.reviewCount} />
          <p className="text-xs text-text-tertiary mt-2 inline-flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1">
              <IconBook className="h-3 w-3" />
              {academy.courseCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconUsers className="h-3 w-3" />
              {formatStudents(academy.studentCount)}
            </span>
          </p>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="hover:border-accent/30 transition-all">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-16 h-16">
          <AcademyLogo academy={academy} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-text-primary">{academy.name}</h3>
                {academy.isVerified ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                    Verified
                  </span>
                ) : null}
                {academy.isNew ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                    New
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-tertiary">{academy.city}</p>
            </div>
            <StarRatingDisplay
              rating={academy.averageRating}
              reviewCount={academy.reviewCount}
              className="shrink-0"
            />
          </div>

          <p className="text-text-secondary text-sm line-clamp-2 mb-3">{academy.description}</p>

          <p className="text-sm text-text-secondary mb-2 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <IconBook className="h-4 w-4 text-text-tertiary" />
              {academy.courseCount} courses
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconUsers className="h-4 w-4 text-text-tertiary" />
              {formatStudents(academy.studentCount)} students
            </span>
            {academy.reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <IconGraduation className="h-4 w-4 text-text-tertiary" />
                {academy.reviewCount} reviews
              </span>
            ) : null}
          </p>

          {academy.specialties.length > 0 ? (
            <p className="text-sm text-text-tertiary mb-2 line-clamp-1">
              {academy.specialties.join(" · ")}
            </p>
          ) : null}

          <p className="text-sm text-text-secondary mb-4 inline-flex items-center gap-1.5">
            <IconCurrency className="h-4 w-4 text-text-tertiary" />
            {formatPriceRange(academy.priceRange)}
          </p>

          <Link href={`/academies/${academy.slug}`}>
            <Button size="sm">View Academy</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
