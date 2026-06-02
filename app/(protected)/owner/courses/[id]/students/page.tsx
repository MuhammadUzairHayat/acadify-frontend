"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import CourseTabs from "@/components/owner/CourseTabs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/apis";
import type { Enrollment } from "@/lib/types";

type SortBy = "enrollmentDate" | "completionPercent" | "name";

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("enrollmentDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [students, setStudents] = useState<Enrollment[]>([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.course.getStudents(courseId, { search, sortBy, sortOrder });
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [courseId, search, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStudents();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchStudents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (enrollment) =>
        enrollment.student.name.toLowerCase().includes(q) ||
        enrollment.student.email.toLowerCase().includes(q),
    );
  }, [students, search]);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const onEnroll = async () => {
    if (!newStudentEmail) return;
    setEnrolling(true);
    setError("");
    try {
      await api.course.enrollStudent(courseId, newStudentEmail);
      setNewStudentEmail("");
      await fetchStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enroll student");
    } finally {
      setEnrolling(false);
    }
  };

  const onRemove = async (enrollmentId: string) => {
    const ok = confirm("Remove this student from the course?");
    if (!ok) return;
    try {
      await api.course.removeStudent(courseId, enrollmentId);
      await fetchStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove student");
    }
  };

  const onExportCsv = () => {
    const rows = [
      ["Name", "Email", "Enrollment Date", "Completion %", "Last Activity"],
      ...filtered.map((e) => [
        e.student.name,
        e.student.email,
        formatDate(e.enrolledAt),
        String(e.progressPercent ?? 0),
        formatDate((e.lastActivityAt as string | undefined) ?? e.completedAt),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `course-${courseId}-students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-text-primary">Student Management</h1>
          <p className="text-text-secondary text-sm">
            Track enrolled learners and manage access
          </p>
          <div className="mt-4">
            <CourseTabs courseId={courseId} />
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Search students"
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sort by
              </label>
              <select
                title="sort by"
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="enrollmentDate">Enrollment date</option>
                <option value="completionPercent">Completion %</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Order
              </label>
              <select
                title="sort order"
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchStudents}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={onExportCsv}>
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                alert("Broadcast messaging endpoint is not implemented yet.")
              }
            >
              Message All Students
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Manual Enrollment</h2>
          <div className="flex gap-2">
            <Input
              placeholder="student@email.com"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
            />
            <Button onClick={onEnroll} loading={enrolling}>
              Enroll
            </Button>
          </div>
        </Card>

        <Card padding="none">
          {loading ? (
            <div className="p-6 text-sm text-text-secondary">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-background-secondary">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Enrollment Date</th>
                    <th className="text-left p-3">Completion</th>
                    <th className="text-left p-3">Last Activity</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-border">
                      <td className="p-3">{enrollment.student.name}</td>
                      <td className="p-3">{enrollment.student.email}</td>
                      <td className="p-3">{formatDate(enrollment.enrolledAt)}</td>
                      <td className="p-3">{enrollment.progressPercent ?? 0}%</td>
                      <td className="p-3">
                        {formatDate(
                          (enrollment.lastActivityAt as string | undefined) ??
                            enrollment.completedAt,
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemove(enrollment.id)}
                          className="text-red-400"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
