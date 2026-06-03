"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { useEnrollmentDetail } from "@/hooks/useOwner";

const formatDate = (date: string | null | undefined) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
};

const formatRelative = (date: string | null | undefined) => {
  if (!date) return "—";
  const ms = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(ms / (60 * 1000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const secondsToHms = (totalSeconds: number) => {
  const s = Math.max(0, totalSeconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export function OwnerEnrollmentsenrollmentIdPageClient() {
  const params = useParams();
  const enrollmentId = params.enrollmentId as string;
  const queryClient = useQueryClient();
  const { data, isLoading, error: loadError } = useEnrollmentDetail(enrollmentId);
  const [error, setError] = useState("");

  const progressPercent = Number(data?.progressPercent ?? 0);
  const status = String(data?.status ?? "ACTIVE");
  const badgeClass =
    status === "ACTIVE"
      ? "bg-green-500/10 text-green-500"
      : status === "COMPLETED"
        ? "bg-blue-500/10 text-blue-500"
        : status === "REFUNDED"
          ? "bg-orange-500/10 text-orange-500"
          : "bg-red-500/10 text-red-500";

  const sections = data?.course?.sections ?? [];
  const lectureProgress = data?.lectureProgress ?? [];
  const progressByLectureId = useMemo(() => {
    const map = new Map<string, { completed?: boolean; watchTime?: number; lastPosition?: number; completedAt?: string }>();
    for (const p of lectureProgress) {
      if (p?.lectureId) map.set(p.lectureId, p);
    }
    return map;
  }, [lectureProgress]);

  const displayError =
    error ||
    (loadError instanceof Error ? loadError.message : loadError ? "Failed to load enrollment" : "");

  const onRemove = async () => {
    const ok = confirm("Remove this enrollment? This cannot be undone.");
    if (!ok) return;
    try {
      await api.enrollment.remove(enrollmentId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
      window.location.href = "/owner/enrollments";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove enrollment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <OwnerPageShell
      eyebrow="Enrollment"
      title={data?.student?.name ?? "Student"}
      subtitle={data?.course?.title ?? "Course"}
      action={
        <div className="flex gap-2 flex-wrap">
          <Link href="/owner/enrollments">
            <Button variant="outline" size="sm" className="rounded-xl">Back</Button>
          </Link>
          <Button variant="danger" size="sm" className="rounded-xl" onClick={() => void onRemove()}>
            Remove
          </Button>
        </div>
      }
      contentClassName="space-y-6"
    >
      <div className="mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}>
          {status}
        </span>
      </div>
        {displayError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {displayError}
          </div>
        ) : null}

        <Card padding="lg" className="border-border-subtle bg-surface/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-text-tertiary">Enrollment ID</div>
              <div className="text-sm text-text-primary mt-1 break-all">{data?.id}</div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary">Enrolled Date</div>
              <div className="text-sm text-text-primary mt-1">{formatDate(data?.enrolledAt)}</div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary">Last Access</div>
              <div className="text-sm text-text-primary mt-1">
                {formatRelative(data?.lastAccessedAt)}{" "}
                <span className="text-text-tertiary">({formatDate(data?.lastAccessedAt)})</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary">Total Watch Time</div>
              <div className="text-sm text-text-primary mt-1">
                {secondsToHms(Number(data?.totalWatchTime ?? 0))}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary">Progress</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-48 h-2 bg-border rounded">
                  <div
                    className="h-2 bg-accent rounded"
                    style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                  />
                </div>
                <div className="text-sm text-text-secondary">{progressPercent}%</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary">Amount Paid</div>
              <div className="text-sm text-text-primary mt-1">
                {Number(data?.amountPaid ?? 0) > 0
                  ? `${data?.currency ?? "USD"} ${data?.amountPaid}`
                  : "Free"}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="border-border-subtle bg-surface/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Lecture Progress</h2>
              <p className="text-sm text-text-secondary">Grouped by sections</p>
            </div>
            <Button variant="outline" onClick={() => alert("Activity log is not implemented yet.")}>
              Activity Log
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {sections.length === 0 ? (
              <div className="text-sm text-text-secondary">No sections found for this course.</div>
            ) : (
              sections.map((section: { id: string; title: string; description?: string; lectures?: { id: string; title: string }[] }) => (
                <div key={section.id} className="border border-border rounded-lg">
                  <div className="px-4 py-3 border-b border-border bg-background-secondary">
                    <div className="font-medium text-text-primary">{section.title}</div>
                    {section.description ? (
                      <div className="text-xs text-text-tertiary mt-1">{section.description}</div>
                    ) : null}
                  </div>
                  <div className="divide-y divide-border">
                    {(section.lectures ?? []).map((lecture) => {
                      const p = progressByLectureId.get(lecture.id);
                      const completed = Boolean(p?.completed);
                      const started =
                        Number(p?.watchTime ?? 0) > 0 || Number(p?.lastPosition ?? 0) > 0;
                      const icon = completed ? "✅" : started ? "⏳" : "⬜";
                      const label = completed ? "Completed" : started ? "In Progress" : "Not Started";
                      return (
                        <div key={lecture.id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{icon}</div>
                            <div>
                              <div className="text-sm text-text-primary">{lecture.title}</div>
                              <div className="text-xs text-text-tertiary">
                                {label}
                                {started ? ` • Watch time: ${secondsToHms(Number(p?.watchTime ?? 0))}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {completed && p?.completedAt ? formatDate(p.completedAt) : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="danger" onClick={() => void onRemove()}>
            Remove from Course
          </Button>
        </div>
    </OwnerPageShell>
  );
}
