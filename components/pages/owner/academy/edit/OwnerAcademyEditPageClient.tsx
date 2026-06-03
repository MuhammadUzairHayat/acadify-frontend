"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { OwnerPageShell } from "@/components/owner/OwnerPageShell";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useMyAcademy } from "@/hooks/useOwner";

interface FormData {
  name: string;
  description: string;
  city: string;
  address: string;
  logo: string;
  banner: string;
}

export function OwnerAcademyEditPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: academyData, isLoading } = useMyAcademy();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasAcademy, setHasAcademy] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    city: "",
    address: "",
    logo: "",
    banner: "",
  });

  useEffect(() => {
    if (isLoading) return;
    if (academyData) {
      setHasAcademy(true);
      setFormData({
        name: academyData.name || "",
        description: academyData.description || "",
        city: academyData.city || "",
        address: academyData.address || "",
        logo: academyData.logo || "",
        banner: academyData.banner || "",
      });
    } else {
      setHasAcademy(false);
    }
  }, [academyData, isLoading]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.academies.my });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (hasAcademy) {
        await api.academy.update(formData);
      } else {
        await api.academy.create(formData);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.academies.my });
      await queryClient.invalidateQueries({ queryKey: queryKeys.academies.all });
      router.push("/owner/academy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save academy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      eyebrow="Institution"
      title={hasAcademy ? "Edit academy" : "New academy"}
      subtitle="Basic details."
      contentClassName="max-w-3xl"
    >
      <RevealOnScroll>
        <Card padding="lg" className="border-border-subtle bg-surface/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Name"
              name="name"
              placeholder="Academy name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe your academy, mission, and what you offer..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                required
              />
            </div>

            <Input
              label="City"
              name="city"
              placeholder="e.g., New York, London, Remote"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <Input
              label="Address (Optional)"
              name="address"
              placeholder="Full address or 'Online Only'"
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              label="Logo URL (Optional)"
              name="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={handleChange}
            />

            <Input
              label="Banner URL (Optional)"
              name="banner"
              type="url"
              placeholder="https://example.com/banner.png"
              value={formData.banner}
              onChange={handleChange}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} className="rounded-xl">
                {hasAcademy ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      </RevealOnScroll>
    </OwnerPageShell>
  );
}
