"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { IconBook, IconStar, IconClock, StarRatingDisplay } from "@/components/academies/AcademyIcons";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useCourseBySlug } from "@/hooks/useCoursesPublic";
import type { CourseEnrollResult } from "@/lib/types";

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

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(/\r?\n/).filter(Boolean);
    }
  }
  return [];
}

export function CoursesslugPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: course, isLoading, error: queryError } = useCourseBySlug(slug ?? "");
  const [enrolling, setEnrolling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [paymentModal, setPaymentModal] = useState<{
    courseId: string;
    courseTitle: string;
    price: number;
    currency: string;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course?.curriculum.length) {
      setExpandedSections({ [course.curriculum[0].id]: true });
    }
  }, [course?.id, course?.curriculum]);

  const error =
    actionError ||
    (queryError instanceof Error ? queryError.message : queryError ? "Course not found" : "");

  const handleEnroll = async () => {
    if (!course) return;

    if (course.isEnrolled) {
      router.push(`/student/courses/${course.id}/play`);
      return;
    }

    setEnrolling(true);
    try {
      const result: CourseEnrollResult = await api.student.enroll(course.id);
      if (result.requiresPayment) {
        setPaymentModal({
          courseId: course.id,
          courseTitle: course.title,
          price: result.price ?? course.price,
          currency: result.currency ?? course.currency,
        });
        return;
      }
      if (result.playUrl) {
        router.push(result.playUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enrollment failed";
      if (message.toLowerCase().includes("authorization") || message.includes("401")) {
        router.push(`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`);
        return;
      }
      setActionError(message);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleWishlist = async () => {
    if (!course || !slug) return;
    try {
      if (course.isWishlisted) {
        await api.student.removeFromWishlist(course.id);
        queryClient.setQueryData(queryKeys.courses.detail(slug), {
          ...course,
          isWishlisted: false,
        });
      } else {
        await api.student.addToWishlist(course.id);
        queryClient.setQueryData(queryKeys.courses.detail(slug), {
          ...course,
          isWishlisted: true,
        });
      }
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <Loader size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-red-400">{error || "Course not found"}</p>
        <Link href="/courses" className="text-accent mt-4 inline-block">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const learnItems = parseJsonList(course.whatYouWillLearn);
  const requirements = parseJsonList(course.requirements);
  const audience = parseJsonList(course.targetAudience);
  const priceLabel =
    course.isFree || course.price === 0 ? "FREE" : `$${course.price.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background-primary pb-24 lg:pb-8">
      {paymentModal ? (
        <PaymentModal
          courseId={paymentModal.courseId}
          courseTitle={paymentModal.courseTitle}
          amount={paymentModal.price}
          currency={paymentModal.currency}
          onClose={() => setPaymentModal(null)}
          onEnrolled={(playUrl) => {
            setPaymentModal(null);
            void queryClient.invalidateQueries({
              queryKey: queryKeys.courses.detail(slug ?? ""),
            });
            router.push(playUrl);
          }}
        />
      ) : null}

      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/courses" className="text-sm text-accent">
            ← Back to courses
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              {course.thumbnail ? (
                <div className="relative w-full h-80 mb-6 rounded-xl overflow-hidden border border-border">
                  <OptimizedImage
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
              ) : null}
              <h1 className="text-3xl font-bold text-text-primary mb-2">{course.title}</h1>
              <p className="text-text-secondary mb-3">
                by{" "}
                <Link href={`/academies/${course.academy.slug}`} className="text-accent">
                  {course.academy.name}
                </Link>
              </p>
              <StarRatingDisplay rating={course.averageRating} reviewCount={course.totalReviews} />

              <div className="flex flex-wrap gap-2 mt-4">
                {course.isBestseller ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                    Bestseller
                  </span>
                ) : null}
                {course.isFeatured ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                    Featured
                  </span>
                ) : null}
                {course.isNew ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                    New
                  </span>
                ) : null}
              </div>
            </div>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-3">About this course</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{course.description}</p>
            </Card>

            {learnItems.length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  What you&apos;ll learn
                </h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {learnItems.map((item) => (
                    <li key={item} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-green-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Course curriculum</h2>
              <div className="space-y-3">
                {course.curriculum.map((section) => (
                  <div key={section.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 text-left bg-background-secondary hover:bg-background-secondary/80"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [section.id]: !prev[section.id],
                        }))
                      }
                    >
                      <span className="font-medium text-text-primary">{section.title}</span>
                      <span className="text-sm text-text-tertiary">
                        {section.lectureCount} lectures · {section.durationMinutes} min
                      </span>
                    </button>
                    {expandedSections[section.id] ? (
                      <ul className="divide-y divide-border">
                        {section.lectures.map((lecture) => (
                          <li
                            key={lecture.id}
                            className="px-4 py-2.5 flex items-center justify-between text-sm"
                          >
                            <span className="text-text-secondary">
                              {lecture.isLocked ? "🔒" : lecture.isFree ? "▶️" : "📄"} {lecture.title}
                            </span>
                            <span className="text-text-tertiary">
                              {lecture.isFree && !lecture.isLocked ? (
                                <span className="text-accent mr-2">Preview</span>
                              ) : lecture.isLocked ? (
                                <span className="mr-2">Locked</span>
                              ) : null}
                              {lecture.duration
                                ? `${Math.round(lecture.duration / 60)} min`
                                : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Instructor</h2>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {course.instructor.profileImage ? (
                    <OptimizedImage
                      src={course.instructor.profileImage}
                      alt={course.instructor.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-accent">
                      {course.instructor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{course.instructor.name}</h3>
                  {course.instructor.bio ? (
                    <p className="text-sm text-text-secondary mt-1">{course.instructor.bio}</p>
                  ) : null}
                  {course.instructor.otherCourses.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-text-secondary mb-2">
                        Other courses by {course.instructor.name}
                      </p>
                      <ul className="space-y-1">
                        {course.instructor.otherCourses.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/courses/${c.slug}`}
                              className="text-sm text-accent hover:underline"
                            >
                              {c.title} (⭐ {c.averageRating.toFixed(1)})
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Student reviews ({course.totalReviews})
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-4xl font-bold text-text-primary mb-1">
                    {course.averageRating.toFixed(1)}
                  </p>
                  <StarRatingDisplay
                    rating={course.averageRating}
                    reviewCount={course.totalReviews}
                  />
                </div>
                <RatingBars
                  distribution={course.ratingDistribution}
                  total={course.totalReviews}
                />
              </div>
              <div className="space-y-4">
                {course.recentReviews.map((review) => (
                  <div key={review.id} className="border-t border-border pt-4">
                    <StarRatingDisplay rating={review.rating} reviewCount={0} />
                    <p className="text-sm font-medium text-text-primary mt-1">
                      {review.studentName}
                    </p>
                    {review.comment ? (
                      <p className="text-sm text-text-secondary mt-1">{review.comment}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            {requirements.length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Requirements</h2>
                <ul className="list-disc list-inside text-text-secondary space-y-1">
                  {requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {audience.length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Target audience</h2>
                <ul className="list-disc list-inside text-text-secondary space-y-1">
                  {audience.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-background-secondary">
                  <p className="text-lg font-semibold text-text-primary">{course.totalStudents}</p>
                  <p className="text-xs text-text-tertiary">Students</p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary">
                  <p className="text-lg font-semibold text-text-primary">{course.totalLectures}</p>
                  <p className="text-xs text-text-tertiary">Lectures</p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary">
                  <p className="text-lg font-semibold text-text-primary inline-flex items-center justify-center gap-1">
                    <IconClock className="h-4 w-4" />
                    {Math.floor(course.totalDuration / 60)}h
                  </p>
                  <p className="text-xs text-text-tertiary">Duration</p>
                </div>
                <div className="p-3 rounded-lg bg-background-secondary">
                  <p className="text-lg font-semibold text-text-primary capitalize">
                    {course.level.toLowerCase()}
                  </p>
                  <p className="text-xs text-text-tertiary">Level</p>
                </div>
              </div>

              <div className="text-center py-2">
                <p className="text-3xl font-bold text-text-primary">{priceLabel}</p>
              </div>

              <Button fullWidth size="lg" loading={enrolling} onClick={() => void handleEnroll()}>
                {course.isEnrolled ? "Continue learning" : "Enroll now"}
              </Button>

              <Button fullWidth variant="outline" onClick={() => void toggleWishlist()}>
                {course.isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </Button>

              <p className="text-xs text-text-tertiary text-center">
                <IconBook className="h-3 w-3 inline mr-1" />
                {course.totalSections} sections · {course.category}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 lg:hidden border-t border-border bg-surface p-4 flex items-center justify-between gap-4">
        <span className="text-xl font-bold text-text-primary">{priceLabel}</span>
        <Button loading={enrolling} onClick={() => void handleEnroll()}>
          {course.isEnrolled ? "Continue" : "Enroll"}
        </Button>
      </div>
    </div>
  );
}
