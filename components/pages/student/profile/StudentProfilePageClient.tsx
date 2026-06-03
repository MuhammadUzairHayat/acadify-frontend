"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useStudentProfile } from "@/hooks/useStudent";
import type { StudentProfile } from "@/lib/types";

export function StudentProfilePageClient() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error: loadError } = useStudentProfile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
    skillsText: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hydrateForm = (data: StudentProfile) => {
    setForm({
      name: data.name || "",
      email: data.email || "",
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
      skillsText: (data.skills || []).join(", "),
    });
  };

  useEffect(() => {
    if (profile) {
      hydrateForm(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await api.student.updateProfile({
        name: form.name.trim(),
        bio: form.bio,
        avatarUrl: form.avatarUrl,
        skills: form.skillsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      hydrateForm(updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.profile });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      setMessage("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const displayError =
    error ||
    (loadError instanceof Error ? loadError.message : loadError ? "Unable to load" : "");

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StudentPageHeader eyebrow="Account" title="Profile" subtitle="Your details." />

      <div className="px-6 md:px-8 py-8 max-w-2xl">
        <RevealOnScroll>
          <Card padding="lg" className="border-border-subtle bg-surface/40 space-y-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input label="Email" value={form.email} disabled />
            <Input
              label="Bio"
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            />
            <Input
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
            />
            <Input
              label="Skills"
              placeholder="e.g. React, Python, Design"
              value={form.skillsText}
              onChange={(event) => setForm((prev) => ({ ...prev, skillsText: event.target.value }))}
            />

            {displayError ? <p className="text-sm text-red-400">{displayError}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

            <Button onClick={handleSave} loading={saving} className="rounded-xl">
              Save
            </Button>
          </Card>
        </RevealOnScroll>
      </div>
    </div>
  );
}
