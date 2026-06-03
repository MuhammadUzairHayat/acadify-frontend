"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { OwnerCoursePageHeader } from "@/components/owner/OwnerCoursePageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { useCourseAnnouncements } from "@/hooks/useOwner";
import type { Announcement } from "@/lib/types";

export function OwnerCoursesidAnnouncementsPageClient() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    isImportant: false,
  });

  const {
    data: items = [],
    isLoading,
    error: loadError,
  } = useCourseAnnouncements(courseId, activeSearch);

  const displayError =
    error ||
    (loadError instanceof Error
      ? loadError.message
      : loadError
        ? "Failed to load announcements"
        : "");

  const invalidateAnnouncements = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["courses", "owner", courseId, "announcements"],
    });
  };

  const resetForm = () => {
    setForm({ title: "", message: "", isImportant: false });
    setEditingId(null);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.course.updateAnnouncement(courseId, editingId, {
          title: form.title,
          message: form.message,
          isImportant: form.isImportant,
        });
      } else {
        await api.course.createAnnouncement(courseId, form);
      }
      resetForm();
      await invalidateAnnouncements();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: Announcement) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.message,
      isImportant: item.isImportant,
    });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api.course.deleteAnnouncement(courseId, id);
      await invalidateAnnouncements();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete announcement");
    }
  };

  const onSearch = () => {
    setActiveSearch(search.trim() || undefined);
  };

  const exportCsv = () => {
    const rows = [
      ["Title", "Message", "Important", "Created At"],
      ...items.map((item) => [
        item.title,
        item.message.replace(/\n/g, " "),
        item.isImportant ? "Yes" : "No",
        new Date(item.createdAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `course-${courseId}-announcements.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      <OwnerCoursePageHeader courseId={courseId} title="Alerts" subtitle="Course announcements." />

      <div className="px-6 md:px-8 py-8 space-y-6">
        {displayError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {displayError}
          </div>
        ) : null}

        <Card padding="lg" className="border-border-subtle bg-surface/40 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Announcement" : "Post Announcement"}
          </h2>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Message
            </label>
            <textarea
              title="announcement message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isImportant}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isImportant: e.target.checked }))
              }
            />
            Mark as important announcement
          </label>
          <div className="flex gap-2">
            <Button onClick={submit} loading={saving}>
              {editingId ? "Update Announcement" : "Post Announcement"}
            </Button>
            {editingId ? (
              <Button variant="ghost" onClick={resetForm}>
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="min-w-[280px] flex-1">
              <Input
                label="Search announcements"
                placeholder="Search title or message"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={onSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
          <p className="text-xs text-text-secondary">{items.length} announcements found</p>
        </Card>

        <Card padding="none">
          {isLoading ? (
            <div className="p-6 text-sm text-text-secondary">Loading announcements...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No announcements found.</div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary">{item.title}</h3>
                        {item.isImportant ? (
                          <span className="rounded-full bg-red-500/10 text-red-400 px-2 py-0.5 text-xs">
                            Important
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap mt-1">
                        {item.message}
                      </p>
                      <p className="text-xs text-text-tertiary mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
