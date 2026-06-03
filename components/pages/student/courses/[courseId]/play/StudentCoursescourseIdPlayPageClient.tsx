"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCoursePlayer } from "@/hooks/useStudent";
import type { Lecture } from "@/lib/types";

export function StudentCoursescourseIdPlayPageClient() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useCoursePlayer(courseId);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!data) return;
    const allLectures = data.sections.flatMap((section) => section.lectures || []);
    const defaultLecture =
      allLectures.find((lecture) => lecture.id === data.currentProgress.lastLectureId) ||
      allLectures[0] ||
      null;
    setCurrentLecture(defaultLecture);
  }, [data]);

  useEffect(() => {
    if (isError) {
      router.push("/student/courses");
    }
  }, [isError, router]);

  const completedMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of data?.watchHistory || []) {
      map.set(item.lectureId, item.completed);
    }
    return map;
  }, [data]);

  const handleMarkComplete = async () => {
    if (!data || !currentLecture) return;
    await api.student.updateLectureProgress(data.course.id, currentLecture.id, {
      completed: true,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.student.player(data.course.id),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.student.dashboard });
  };

  if (isLoading) {
    return <div className="p-8 text-text-secondary">Loading course...</div>;
  }

  if (!data) {
    return <div className="p-8 text-text-secondary">Course not found.</div>;
  }

  const isComplete = data.currentProgress.overallProgress >= 100;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setReviewSubmitting(true);
    setReviewMessage("");
    try {
      await api.student.submitCourseReview(data.course.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSubmitted(true);
      setReviewMessage("Thank you! Your review helps other students choose academies.");
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.push("/student/courses")}>
          Back to My Courses
        </Button>
        <p className="text-sm text-text-secondary">
          Progress: <span className="font-semibold">{data.currentProgress.overallProgress}%</span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{data.course.title}</h1>
            <p className="text-text-secondary mb-4">
              {currentLecture?.title || "Select a lecture from the sidebar"}
            </p>
            <div className="aspect-video rounded bg-background-secondary border border-border flex items-center justify-center">
              <p className="text-text-secondary text-center px-6">
                Video player area. Integrate your player using lecture `videoUrl` in the next step.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleMarkComplete} disabled={!currentLecture}>
                Mark as Complete
              </Button>
            </div>
          </Card>

          {isComplete ? (
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Rate this course</h2>
              <p className="text-sm text-text-secondary mb-4">
                Your review is shown on the academy page and counts toward its rating.
              </p>
              {reviewSubmitted ? (
                <p className="text-sm text-green-400">{reviewMessage}</p>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-sm text-text-secondary block mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(+e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background-secondary text-text-primary"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary block mb-1">
                      Comment (optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background-secondary text-text-primary"
                      placeholder="What did you learn? How was the teaching?"
                    />
                  </div>
                  {reviewMessage ? (
                    <p className="text-sm text-red-400">{reviewMessage}</p>
                  ) : null}
                  <Button type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? "Submitting..." : "Submit review"}
                  </Button>
                </form>
              )}
            </Card>
          ) : null}
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Course Content</h3>
          <div className="space-y-4 max-h-[70vh] overflow-auto">
            {data.sections.map((section) => (
              <div key={section.id}>
                <p className="font-medium text-text-primary mb-2">{section.title}</p>
                <div className="space-y-2">
                  {(section.lectures || []).map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => setCurrentLecture(lecture)}
                      className={`w-full text-left p-2 rounded border ${
                        currentLecture?.id === lecture.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-background-hover"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{lecture.title}</span>
                        {completedMap.get(lecture.id) ? (
                          <span className="text-xs text-green-400">Completed</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
