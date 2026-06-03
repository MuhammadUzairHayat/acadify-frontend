"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useStudentCertificates } from "@/hooks/useStudent";

export function StudentCertificatesPageClient() {
  const queryClient = useQueryClient();
  const { data: certificates = [], isLoading, error: loadError } = useStudentCertificates();
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const displayError =
    error ||
    (loadError instanceof Error
      ? loadError.message
      : loadError
        ? "Unable to load"
        : "");

  const handleDownload = async (certificateId: string) => {
    setActionMessage("");
    try {
      const data = await api.student.downloadCertificate(certificateId);
      window.open(data.verifyUrl, "_blank", "noopener,noreferrer");
      setActionMessage(`Opened: ${data.courseTitle}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.certificates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open");
    }
  };

  return (
    <div className="min-h-screen">
      <StudentPageHeader
        eyebrow="Achievements"
        title="Certificates"
        subtitle="Earned on course completion."
      />

      <div className="px-6 md:px-8 py-8">
        {displayError ? <p className="text-sm text-red-400 mb-4">{displayError}</p> : null}
        {actionMessage ? <p className="text-sm text-emerald-400 mb-4">{actionMessage}</p> : null}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : certificates.length === 0 ? (
          <RevealOnScroll>
            <Card padding="lg" className="border-border-subtle bg-surface/40 text-center py-12">
              <p className="text-text-primary font-medium mb-1">None yet</p>
              <p className="text-sm text-text-secondary mb-4">Complete a course to earn one.</p>
              <Link href="/student/courses">
                <Button variant="outline" size="sm" className="rounded-xl">
                  My courses
                </Button>
              </Link>
            </Card>
          </RevealOnScroll>
        ) : (
          <RevealGroup className="space-y-3" stagger={70}>
            {certificates.map((certificate, index) => (
              <RevealItem key={certificate.id} index={index}>
                <div className="rounded-xl border border-border-subtle bg-surface/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary line-clamp-1">
                      {certificate.course.title}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(certificate.issuedAt).toLocaleDateString()} · {certificate.certificateId}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/student/certificates/${certificate.certificateId}`}>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void handleDownload(certificate.certificateId)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
