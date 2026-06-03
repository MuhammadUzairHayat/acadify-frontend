import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { CourseListItem } from "@/lib/types";
import {
  IconBook,
  IconClock,
  StarRatingDisplay,
} from "@/components/academies/AcademyIcons";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatPrice(course: CourseListItem) {
  if (course.isFree || course.price === 0) return "FREE";
  return `$${course.price.toFixed(2)}`;
}

function CourseBadges({ course }: { course: CourseListItem }) {
  const badges: { label: string; className: string }[] = [];

  if (course.badge === "trending") {
    badges.push({ label: "Trending", className: "bg-orange-500/10 text-orange-400" });
  } else if (course.badge === "popular") {
    badges.push({ label: "Popular", className: "bg-orange-500/10 text-orange-400" });
  }
  if (course.badge === "featured" || course.isFeatured) {
    badges.push({ label: "Featured", className: "bg-purple-500/10 text-purple-400" });
  }
  if (course.badge === "new" || course.isNew) {
    badges.push({ label: "New", className: "bg-green-500/10 text-green-400" });
  }
  if (course.isBestseller) {
    badges.push({ label: "Bestseller", className: "bg-yellow-500/10 text-yellow-400" });
  }
  if (course.isFree || course.price === 0) {
    badges.push({ label: "Free", className: "bg-emerald-500/10 text-emerald-400" });
  }

  const shown = badges.slice(0, 2);
  if (shown.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {shown.map((b) => (
        <span key={b.label} className={`text-xs px-2 py-0.5 rounded-full ${b.className}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

function CourseThumbnail({
  course,
  className = "w-full h-full",
}: {
  course: CourseListItem;
  className?: string;
}) {
  return (
    <div className={`${className} bg-accent/10 rounded-lg overflow-hidden shrink-0 relative`}>
      {course.thumbnail ? (
        <OptimizedImage src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="160px" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-accent">
          <IconBook className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

type CourseCardProps = {
  course: CourseListItem;
  variant?: "list" | "grid" | "compact";
  onEnroll?: (course: CourseListItem) => void;
};

export function CourseCard({ course, variant = "list", onEnroll }: CourseCardProps) {
  const detailHref = `/courses/${course.slug}`;

  if (variant === "grid" || variant === "compact") {
    return (
      <Link href={detailHref}>
        <Card className="hover:border-accent/30 transition-all h-full overflow-hidden">
          <div className={variant === "compact" ? "h-28" : "h-36"}>
            <CourseThumbnail course={course} />
          </div>
          <div className="p-4">
            <CourseBadges course={course} />
            <h3 className="font-semibold text-text-primary line-clamp-2 mb-1">{course.title}</h3>
            <StarRatingDisplay rating={course.averageRating} reviewCount={course.totalReviews} />
            <p className="text-xs text-text-tertiary mt-2 line-clamp-1">{course.academy.name}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-semibold text-text-primary">{formatPrice(course)}</span>
              {onEnroll ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onEnroll(course);
                  }}
                >
                  Enroll
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="hover:border-accent/30 transition-all overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href={detailHref} className="sm:w-40 h-28 sm:h-24 shrink-0">
          <CourseThumbnail course={course} />
        </Link>
        <div className="flex-1 min-w-0">
          <CourseBadges course={course} />
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <Link href={detailHref}>
                <h3 className="text-lg font-semibold text-text-primary hover:text-accent transition line-clamp-2">
                  {course.title}
                </h3>
              </Link>
              <p className="text-sm text-text-tertiary mt-0.5">
                by{" "}
                <Link href={`/academies/${course.academy.slug}`} className="hover:text-accent">
                  {course.academy.name}
                </Link>
              </p>
            </div>
            <StarRatingDisplay
              rating={course.averageRating}
              reviewCount={course.totalReviews}
              className="shrink-0"
            />
          </div>

          <p className="text-sm text-text-secondary flex flex-wrap items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1">
              <IconBook className="h-4 w-4 text-text-tertiary" />
              {course.totalLectures} lectures
            </span>
            <span className="inline-flex items-center gap-1">
              <IconClock className="h-4 w-4 text-text-tertiary" />
              {formatDuration(course.totalDuration)}
            </span>
            <span className="capitalize">{course.level.toLowerCase()}</span>
          </p>

          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {course.shortDescription || course.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-semibold text-text-primary">{formatPrice(course)}</span>
            <div className="flex gap-2">
              <Link href={detailHref}>
                <Button size="sm" variant="outline">
                  Preview
                </Button>
              </Link>
              {onEnroll ? (
                <Button size="sm" onClick={() => onEnroll(course)}>
                  Enroll Now
                </Button>
              ) : (
                <Link href={detailHref}>
                  <Button size="sm">Enroll Now</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
