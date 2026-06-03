"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { OwnerCoursePageHeader } from "@/components/owner/OwnerCoursePageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { useOwnerCourse } from "@/hooks/useOwner";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const levels = ["BEGINNER", "INTERMEDIATE", "EXPERT"];
const categories = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Language",
  "Health",
];

export function OwnerCoursesidSettingsPageClient() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { data: course, isLoading, error: loadError } = useOwnerCourse(courseId);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    level: "BEGINNER",
    category: "",
    tags: "",
    price: 0,
    currency: "USD",
    whatYouWillLearn: "",
    targetAudience: "",
    requirements: "",
    status: "DRAFT" as Status,
  });

  const isFree = Number(form.price) <= 0;

  const learnBullets = useMemo(
    () =>
      form.whatYouWillLearn
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [form.whatYouWillLearn],
  );

  useEffect(() => {
    if (!course) return;
    setForm({
      title: course.title ?? "",
      description: course.description ?? "",
      thumbnail: course.thumbnail ?? "",
      level: (course.level ?? "BEGINNER").toUpperCase(),
      category: course.category ?? "",
      tags: (course.tags ?? []).join(", "),
      price: Number(course.price ?? 0),
      currency: course.currency ?? "USD",
      whatYouWillLearn: course.whatYouWillLearn ?? "",
      targetAudience: course.targetAudience ?? "",
      requirements: course.requirements ?? "",
      status: (course.status ?? (course.isPublished ? "PUBLISHED" : "DRAFT")) as Status,
    });
  }, [course]);

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const applyYoutubeThumbnail = () => {
    const match = form.thumbnail.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
    );
    if (!match) return;
    setForm((prev) => ({
      ...prev,
      thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
    }));
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.course.update(courseId, {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail || undefined,
        level: form.level,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        price: Number(form.price),
        currency: form.currency,
        whatYouWillLearn: learnBullets.join("\n"),
        targetAudience: form.targetAudience,
        requirements: form.requirements,
        status: form.status,
        isPublished: form.status === "PUBLISHED",
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.courses.owner.detail(courseId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.owner.all });
      setSuccess("Course settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const displayError =
    error ||
    (loadError instanceof Error ? loadError.message : loadError ? "Failed to load course" : "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <OwnerCoursePageHeader courseId={courseId} title="Settings" subtitle="Details & pricing." />

      <div className="px-6 md:px-8 py-8 max-w-4xl space-y-6">
        <Card padding="lg" className="border-border-subtle bg-surface/40 space-y-4">
          {displayError ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {displayError}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          ) : null}

          <Input name="title" label="Course Title" value={form.title} onChange={updateField} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              title="description"
              placeholder="Describe what students will learn..."
              name="description"
              rows={5}
              value={form.description}
              onChange={updateField}
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                name="thumbnail"
                label="Thumbnail URL"
                value={form.thumbnail}
                onChange={updateField}
              />
              <button
                className="text-xs text-accent mt-1"
                type="button"
                onClick={applyYoutubeThumbnail}
              >
                Auto-generate from YouTube URL
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Level
              </label>
              <select
                title="level"
                name="level"
                value={form.level}
                onChange={updateField}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <select
                title="category"
                name="category"
                value={form.category}
                onChange={updateField}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <Input
              name="tags"
              label="Tags (comma separated)"
              value={form.tags}
              onChange={updateField}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="price"
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={String(form.price)}
              onChange={updateField}
            />
            <Input
              name="currency"
              label="Currency"
              value={form.currency}
              onChange={updateField}
              disabled={isFree}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              What students will learn (one bullet per line)
            </label>
            <textarea
              title="whatYouWillLearn"
              placeholder="What students will learn (one bullet per line)"
              name="whatYouWillLearn"
              rows={4}
              value={form.whatYouWillLearn}
              onChange={updateField}
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
            />
          </div>
          <Input
            name="targetAudience"
            label="Target Audience"
            value={form.targetAudience}
            onChange={updateField}
          />
          <Input
            name="requirements"
            label="Requirements / Prerequisites"
            value={form.requirements}
            onChange={updateField}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Publish Status
            </label>
            <select
              title="status"
              name="status"
              value={form.status}
              onChange={updateField}
              className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="pt-2">
            <Button onClick={onSave} loading={saving}>
              Save Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
