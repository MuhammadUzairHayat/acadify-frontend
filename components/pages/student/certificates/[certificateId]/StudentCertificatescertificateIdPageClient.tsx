"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/apis";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useStudentCertificate } from "@/hooks/useStudent";

export function StudentCertificatescertificateIdPageClient() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { data: certificate, isLoading, error: loadError } = useStudentCertificate(certificateId);
  const [error, setError] = useState("");

  const displayError =
    error ||
    (loadError instanceof Error
      ? loadError.message
      : loadError
        ? "Certificate not found"
        : "");

  const handleOpen = async () => {
    if (!certificate) return;
    try {
      const data = await api.student.downloadCertificate(certificate.certificateId);
      window.open(data.verifyUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open certificate");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-8">
        <p className="text-red-400">{displayError || "Certificate not found"}</p>
        <Link href="/student/certificates" className="text-accent mt-4 inline-block">
          Back to certificates
        </Link>
      </div>
    );
  }

  const studentName = certificate.studentName || "Student";
  const courseTitle = certificate.courseTitle || certificate.course?.title || "Course";

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/student/certificates" className="text-accent text-sm mb-4 inline-block">
        ← Back to certificates
      </Link>

      <Card className="text-center border-2 border-accent/30">
        <p className="text-sm uppercase tracking-widest text-text-tertiary mb-4">
          Certificate of Completion
        </p>
        <p className="text-text-secondary mb-2">Awarded to</p>
        <h1 className="text-3xl font-bold text-text-primary mb-6">{studentName}</h1>
        <p className="text-text-secondary mb-2">For completing</p>
        <h2 className="text-xl font-semibold text-text-primary mb-6">{courseTitle}</h2>
        <p className="text-sm text-text-secondary">
          Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
        </p>
        {certificate.completionDate ? (
          <p className="text-sm text-text-tertiary mt-1">
            Completed: {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
        ) : null}
        <p className="text-xs text-text-tertiary mt-4">ID: {certificate.certificateId}</p>

        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => void handleOpen()}>Open / Download</Button>
        </div>
      </Card>
    </div>
  );
}
