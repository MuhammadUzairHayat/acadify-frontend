"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/apis";
import type { Course, Enrollment, EnrollmentStats } from "@/lib/types";

type SortBy =
  | "studentName"
  | "studentEmail"
  | "courseTitle"
  | "enrolledAt"
  | "status"
  | "progressPercent"
  | "lastAccessedAt";

type StatusFilter = "ALL" | NonNullable<Enrollment["status"]>;

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export default function OwnerEnrollmentsPage() {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("enrolledAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [manualOpen, setManualOpen] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualCourseId, setManualCourseId] = useState("");
  const [manualStatus, setManualStatus] = useState<NonNullable<Enrollment["status"]>>("ACTIVE");
  const [manualAmountPaid, setManualAmountPaid] = useState<string>("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCourseId, setBulkCourseId] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkStatus, setBulkStatus] = useState<NonNullable<Enrollment["status"]>>("ACTIVE");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    totalEntered: number;
    uniqueEmails: number;
    validEmailsFound: number;
    notFound: string[];
    createdCount: number;
    skippedAlreadyEnrolledCount: number;
  } | null>(null);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const fetchCourses = useCallback(async () => {
    const response = await api.course.getMy();
    const resolved = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
    setCourses(resolved);
  }, []);

  const fetchStats = useCallback(async () => {
    const data = (await api.enrollment.getStats({ courseId: courseId || undefined })) as EnrollmentStats;
    setStats(data);
  }, [courseId]);

  const fetchEnrollments = useCallback(async () => {
    const result = (await api.enrollment.list({
      page,
      limit,
      search: search.trim() || undefined,
      courseId: courseId || undefined,
      status: status === "ALL" ? undefined : status,
      from: from || undefined,
      to: to || undefined,
      sortBy,
      sortOrder,
    })) as { data: Enrollment[]; meta: { total: number; page: number; limit: number; totalPages: number } };

    setEnrollments(Array.isArray(result?.data) ? result.data : []);
    setMeta(result?.meta ?? null);
    setSelected({});
  }, [courseId, from, limit, page, search, sortBy, sortOrder, status, to]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchCourses(), fetchStats(), fetchEnrollments()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchEnrollments, fetchStats]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh, pathname]);

  const toggleAllOnPage = (value: boolean) => {
    const next: Record<string, boolean> = {};
    enrollments.forEach((e) => {
      next[e.id] = value;
    });
    setSelected(next);
  };

  const resetFilters = () => {
    setSearch("");
    setCourseId("");
    setStatus("ALL");
    setFrom("");
    setTo("");
    setSortBy("enrolledAt");
    setSortOrder("desc");
    setPage(1);
  };

  const onExportCsv = async () => {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (courseId) query.set("courseId", courseId);
    if (status !== "ALL") query.set("status", status);
    if (from) query.set("from", from);
    if (to) query.set("to", to);

    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/enrollments/export/csv${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    // Use fetch so auth header is included, then download as file.
    const response = await fetch(url, {
      headers: {
        ...(typeof window !== "undefined" && localStorage.getItem("token")
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {}),
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Export failed");
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "enrollments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const onRemove = async (enrollmentId: string) => {
    const ok = confirm("Remove this enrollment? This cannot be undone.");
    if (!ok) return;
    try {
      await api.enrollment.remove(enrollmentId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove enrollment");
    }
  };

  const onBulkRemove = async () => {
    if (selectedIds.length === 0) return;
    const ok = confirm(`Remove ${selectedIds.length} enrollment(s)?`);
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => api.enrollment.remove(id)));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk remove failed");
    }
  };

  const openManual = () => {
    setManualCourseId(courseId || (courses[0]?.id ?? ""));
    setManualEmail("");
    setManualStatus("ACTIVE");
    setManualAmountPaid("");
    setManualOpen(true);
  };

  const submitManual = async () => {
    if (!manualCourseId || !manualEmail.trim()) return;
    setManualSubmitting(true);
    setError("");
    try {
      const amountPaid = manualAmountPaid.trim() ? Number(manualAmountPaid) : undefined;
      await api.enrollment.manualEnroll({
        courseId: manualCourseId,
        studentEmail: manualEmail.trim(),
        status: manualStatus,
        ...(Number.isFinite(amountPaid as number) ? { amountPaid } : {}),
      });
      setManualOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Manual enrollment failed");
    } finally {
      setManualSubmitting(false);
    }
  };

  const openBulk = () => {
    setBulkCourseId(courseId || (courses[0]?.id ?? ""));
    setBulkEmails("");
    setBulkStatus("ACTIVE");
    setBulkResult(null);
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (!bulkCourseId || !bulkEmails.trim()) return;
    setBulkSubmitting(true);
    setError("");
    try {
      const result = await api.enrollment.bulkEnroll({
        courseId: bulkCourseId,
        studentEmails: bulkEmails,
        status: bulkStatus,
      });
      setBulkResult(result);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk enrollment failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const downloadFailedEmails = () => {
    if (!bulkResult?.notFound?.length) return;
    const csv = bulkResult.notFound.join("\n");
    const blob = new Blob([csv], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "failed-emails.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Enrollments</h1>
              <p className="text-text-secondary text-sm">
                Manage students across all your courses
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void onExportCsv()}>
                Export CSV
              </Button>
              <Button variant="outline" onClick={openBulk}>
                Bulk Enroll
              </Button>
              <Button onClick={openManual}>Manual Enroll</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-text-secondary">Total Enrollments</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats?.totalEnrollments ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary">Active Students</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats?.activeStudents ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary">Completed</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats?.completed ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary">Total Revenue</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Course
              </label>
              <select
                title="course"
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                title="status"
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusFilter);
                  setPage(1);
                }}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <Input
              label="From"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="To"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="Search"
              placeholder="Student name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => void refresh()}>
                Apply
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-text-secondary">Sort</div>
              <select
                title="sortBy"
                className="px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="enrolledAt">Enrolled date</option>
                <option value="studentName">Student name</option>
                <option value="status">Status</option>
                <option value="progressPercent">Progress</option>
                <option value="lastAccessedAt">Last active</option>
              </select>
              <select
                title="sortOrder"
                className="px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <select
                title="limit"
                className="px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm"
                value={String(limit)}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}/page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Bulk actions */}
        {selectedIds.length > 0 ? (
          <Card className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {selectedIds.length} selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => alert("Bulk email is not implemented yet.")}
              >
                Bulk Email
              </Button>
              <Button variant="danger" onClick={() => void onBulkRemove()}>
                Bulk Remove
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Table */}
        <Card padding="none">
          {enrollments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-text-primary font-semibold mb-2">No enrollments yet</div>
              <div className="text-sm text-text-secondary mb-4">
                Students will appear here when they enroll in your courses.
              </div>
              <Link href="/owner/courses">
                <Button variant="secondary">View Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-background-secondary">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        title="select all"
                        type="checkbox"
                        checked={enrollments.every((e) => selected[e.id])}
                        onChange={(e) => toggleAllOnPage(e.target.checked)}
                      />
                    </th>
                    <th className="text-left p-3">Student</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Course</th>
                    <th className="text-left p-3">Enrolled</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Progress</th>
                    <th className="text-left p-3">Last Active</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const statusLabel = (e.status || "ACTIVE").toString();
                    const badgeClass =
                      e.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-500"
                        : e.status === "COMPLETED"
                          ? "bg-blue-500/10 text-blue-500"
                          : e.status === "REFUNDED"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-red-500/10 text-red-500";

                    return (
                      <tr key={e.id} className="border-b border-border">
                        <td className="p-3">
                          <input
                            title="select"
                            type="checkbox"
                            checked={!!selected[e.id]}
                            onChange={(ev) =>
                              setSelected((s) => ({ ...s, [e.id]: ev.target.checked }))
                            }
                          />
                        </td>
                        <td className="p-3">{e.student?.name ?? "—"}</td>
                        <td className="p-3">{e.student?.email ?? "—"}</td>
                        <td className="p-3">{(e as any)?.course?.title ?? "—"}</td>
                        <td className="p-3">{formatDate(e.enrolledAt)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-border rounded">
                              <div
                                className="h-2 bg-accent rounded"
                                style={{ width: `${Math.max(0, Math.min(100, Number((e as any)?.progressPercent ?? 0)))}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary">
                              {Number((e as any)?.progressPercent ?? 0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {formatRelative(((e as any)?.lastAccessedAt as string | undefined) ?? null)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Link href={`/owner/enrollments/${e.id}`}>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400"
                              onClick={() => void onRemove(e.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {meta ? (
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div>
              Page {meta.page} of {meta.totalPages} • {meta.total} total
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.totalPages === 0 || page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Enrollment">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Course</label>
            <select
              title="bulk-course"
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              value={bulkCourseId}
              onChange={(e) => setBulkCourseId(e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Student emails (one per line)
            </label>
            <textarea
              title="bulk-emails"
              className="w-full min-h-32 px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-sm"
              placeholder={"student1@email.com\nstudent2@email.com"}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            <select
              title="bulk-status"
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as NonNullable<Enrollment["status"]>)}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {bulkResult ? (
            <div className="rounded-lg border border-border bg-background-secondary p-3 text-sm space-y-1">
              <div>Total emails entered: {bulkResult.totalEntered}</div>
              <div>Unique emails: {bulkResult.uniqueEmails}</div>
              <div>Valid emails found: {bulkResult.validEmailsFound}</div>
              <div>New enrollments created: {bulkResult.createdCount}</div>
              <div>Already enrolled (skipped): {bulkResult.skippedAlreadyEnrolledCount}</div>
              <div>Not found: {bulkResult.notFound.length}</div>
              {bulkResult.notFound.length > 0 ? (
                <Button size="sm" variant="outline" onClick={downloadFailedEmails}>
                  Download failed emails
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Close
            </Button>
            <Button loading={bulkSubmitting} onClick={() => void submitBulk()}>
              Enroll All
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={manualOpen} onClose={() => setManualOpen(false)} title="Manual Enrollment">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Course</label>
            <select
              title="manual-course"
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              value={manualCourseId}
              onChange={(e) => setManualCourseId(e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Student email"
            placeholder="student@email.com"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            <select
              title="manual-status"
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value as any)}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <Input
            label="Amount paid (optional)"
            type="number"
            min="0"
            placeholder="0"
            value={manualAmountPaid}
            onChange={(e) => setManualAmountPaid(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
            <Button loading={manualSubmitting} onClick={() => void submitManual()}>
              Enroll
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

