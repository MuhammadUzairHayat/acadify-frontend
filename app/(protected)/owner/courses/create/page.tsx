"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/apis";

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  thumbnail: string;
  isPublished: boolean;
}

const categories = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Language",
  "Health & Fitness",
];

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function CreateCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: 0,
    category: "",
    level: "BEGINNER",
    thumbnail: "",
    isPublished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.course.create(formData);
      router.push("/owner/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const value =
      e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  return (
    <div>
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-text-primary">
            Create New Course
          </h1>
          <p className="text-text-secondary text-sm">
            Add a new course to your academy
          </p>
        </div>
      </header>

      <div className="p-8 max-w-3xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Course Title"
              name="title"
              placeholder="e.g., Complete Web Development Bootcamp"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Describe what students will learn..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price ($)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="49.99"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Category
                </label>
                <select
                  title="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Level
              </label>
              <select
                title="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Thumbnail URL (Optional)"
              name="thumbnail"
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              value={formData.thumbnail}
              onChange={handleChange}
            />

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-border bg-background-secondary text-accent focus:ring-accent/20"
              />
              <label htmlFor="isPublished" className="text-text-primary">
                Publish immediately (visible to students)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create Course
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
