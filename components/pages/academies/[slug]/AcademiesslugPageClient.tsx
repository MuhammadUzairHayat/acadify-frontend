"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  IconBuilding,
  IconBook,
  IconUsers,
  IconCurrency,
  IconGraduation,
  StarRatingDisplay,
  IconStar,
} from "@/components/academies/AcademyIcons";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAcademyBySlug } from "@/hooks/useCoursesPublic";

function RatingBars({
  distribution,
  total,
}: {
  distribution: Record<string, number>;
  total: number;
}) {
  const stars = [5, 4, 3, 2, 1];
  return (
    <div className="space-y-2">
      {stars.map((star) => {
        const count = distribution[String(star)] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-8 text-text-secondary inline-flex items-center gap-0.5">
              {star}
              <IconStar className="h-3 w-3 text-yellow-400" filled />
            </span>
            <div className="flex-1 h-2 rounded-full bg-background-secondary overflow-hidden">
              <div
                className="h-full bg-yellow-400/80 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-text-tertiary">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AcademiesslugPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const { data: academy, isLoading, error: queryError } = useAcademyBySlug(slug ?? "");
  const error = queryError instanceof Error ? queryError.message : queryError ? "Academy not found" : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <Loader size="lg" />
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-red-400">{error || "Academy not found"}</p>
        <Link href="/academies" className="text-accent mt-4 inline-block">
          ← All academies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {academy.banner ? (
        <div
          className="h-48 sm:h-64 bg-cover bg-center border-b border-border"
          style={{ backgroundImage: `url(${academy.banner})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-accent/20 to-surface border-b border-border" />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/academies" className="text-sm text-accent mb-6 inline-block">
          ← All academies
        </Link>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="w-20 h-20 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden border border-border text-accent relative">
            {academy.logo ? (
              <OptimizedImage src={academy.logo} alt={academy.name} fill className="object-cover" sizes="80px" />
            ) : (
              <IconBuilding className="h-10 w-10" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-text-primary">{academy.name}</h1>
              {academy.isVerified ? (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  Verified
                </span>
              ) : null}
              {academy.isNew ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  New
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <StarRatingDisplay
                rating={academy.averageRating}
                reviewCount={academy.reviewCount}
              />
              <span className="inline-flex items-center gap-1">
                <IconBook />
                {academy.courseCount} courses
              </span>
              <span className="inline-flex items-center gap-1">
                <IconUsers />
                {academy.studentCount} students
              </span>
              <span>{academy.city}</span>
            </div>
            {academy.ownerName ? (
              <p className="text-sm text-text-tertiary mt-1">Led by {academy.ownerName}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="flex justify-center mb-1 text-accent">
              <IconBook className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{academy.courseCount}</p>
            <p className="text-sm text-text-secondary">Courses</p>
          </Card>
          <Card className="text-center">
            <div className="flex justify-center mb-1 text-accent">
              <IconUsers className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{academy.studentCount}</p>
            <p className="text-sm text-text-secondary">Students</p>
          </Card>
          <Card className="text-center">
            <div className="flex justify-center mb-1 text-yellow-400">
              <IconStar className="h-6 w-6" filled />
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {academy.reviewCount > 0 ? academy.averageRating.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-text-secondary">Avg rating</p>
          </Card>
          <Card className="text-center">
            <div className="flex justify-center mb-1 text-accent">
              <IconCurrency className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {academy.priceRange.max === 0 ? "Free" : `$${academy.priceRange.avg}`}
            </p>
            <p className="text-sm text-text-secondary">Avg price</p>
          </Card>
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-3">About</h2>
          <p className="text-text-secondary whitespace-pre-wrap">{academy.description}</p>
          {academy.specialties.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {academy.specialties.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-background-secondary border border-border text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4 inline-flex items-center gap-2">
            <IconGraduation className="h-5 w-5 text-accent" />
            Popular courses
          </h2>
          {academy.popularCourses.length === 0 ? (
            <p className="text-text-secondary">No published courses yet.</p>
          ) : (
            <div className="space-y-3">
              {academy.popularCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-text-primary">{course.title}</p>
                    <p className="text-sm text-text-secondary">
                      {course.category} · {course.level} · {course.studentCount} students
                      {course.price === 0 ? " · Free" : ` · $${course.price}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Student reviews</h2>
          <p className="text-text-secondary text-sm mb-6">
            Ratings come from students who completed a course at this academy.
          </p>

          {academy.reviewCount === 0 ? (
            <p className="text-text-tertiary">No reviews yet for this academy.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-text-primary">
                    {academy.averageRating.toFixed(1)}
                  </span>
                  <StarRatingDisplay
                    rating={academy.averageRating}
                    reviewCount={academy.reviewCount}
                  />
                </div>
                <RatingBars
                  distribution={academy.ratingDistribution}
                  total={academy.reviewCount}
                />
              </div>

              <div className="space-y-4">
                {academy.recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border border-border bg-background-secondary/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-text-primary text-sm">
                        {review.studentName}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-yellow-400 text-sm">
                        {review.rating}
                        <IconStar className="h-3.5 w-3.5" filled />
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mb-2">{review.courseTitle}</p>
                    {review.comment ? (
                      <p className="text-sm text-text-secondary">{review.comment}</p>
                    ) : null}
                    <p className="text-xs text-text-tertiary mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
