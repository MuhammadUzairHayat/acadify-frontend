"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/apis";
import { Academy } from "@/lib/types";


export default function AcademyPage() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<Academy | null>(null);

  const fetchAcademy = async () => {
    setLoading(true);
    setAcademy(null);

    try {
      const data = await api.academy.getMy();
      if (data) {
        setAcademy(data);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: unknown }).message
          : undefined;

      if (msg !== "Academy not found") {
        console.error("Error fetching academy:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAcademy();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!academy) {
    return (
      <div>
        <header className="bg-surface border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-text-primary">My Academy</h1>
          </div>
        </header>
        <div className="p-8">
          <Card className="max-w-2xl mx-auto text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
              <svg
                className="h-8 w-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              No Academy Yet
            </h2>
            <p className="text-text-secondary mb-6">
              Create your academy to start offering courses and building your
              brand.
            </p>
            <Link href="/owner/academy/edit">
              <Button>Create Academy</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (!academy) return null;

  return (
    <div>
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-text-primary">My Academy</h1>
        </div>
      </header>

      <div className="p-8">
        <div className="space-y-6">
          {/* Academy Banner */}
          <div className="relative h-48 bg-linear-to-r from-accent to-secondary rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-4 left-6 flex items-end gap-4">
              <div className="w-24 h-24 bg-surface rounded-xl border-4 border-surface overflow-hidden flex items-center justify-center">
                {academy.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={academy.logo}
                    alt={academy.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-12 w-12 text-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {academy.name}
                </h2>
                <p className="text-white/80 text-sm">{academy.city}</p>
              </div>
            </div>
          </div>

          {/* Academy Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  Information
                </h3>
                <Link href="/owner/academy/edit">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-text-secondary text-sm">Description</p>
                  <p className="text-text-primary">
                    {academy.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Address</p>
                  <p className="text-text-primary">
                    {academy.address || "No address provided"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Slug</p>
                  <p className="text-text-primary font-mono text-sm">
                    /academies/{academy.slug}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">
                    Verification Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${academy.isVerified ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}
                  >
                    {academy.isVerified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Approval Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${academy.isApproved ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}
                  >
                    {academy.isApproved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Created</p>
                  <p className="text-text-primary">
                    {new Date(academy.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Public Profile Link */}
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-text-primary">
                  Public Profile
                </h3>
                <p className="text-text-secondary text-sm">
                  View your academy&apos;s public page
                </p>
              </div>
              <Link href={`/academies/${academy.slug}`} target="_blank">
                <Button variant="outline">
                  View Public Page
                  <svg
                    className="h-4 w-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
