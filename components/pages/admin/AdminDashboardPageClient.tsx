"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";

const TIER_STYLES: Record<string, string> = {
  PRO: "bg-accent/15 text-accent",
  STARTER: "bg-blue-500/15 text-blue-400",
  ENTERPRISE: "bg-amber-500/15 text-amber-400",
  FREE: "bg-background-hover text-text-secondary",
};

function tierLabel(tier: string | undefined) {
  return tier ?? "FREE";
}

export function AdminDashboardPageClient() {
  const queryClient = useQueryClient();
  const [assignTarget, setAssignTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [maxCourses, setMaxCourses] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [storageGB, setStorageGB] = useState("");

  const academiesQuery = useQuery({
    queryKey: queryKeys.admin.academies,
    queryFn: () => api.admin.listAcademies(),
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => api.admin.getStats(),
  });

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!assignTarget) throw new Error("No academy selected");
      return api.admin.assignEnterprise(assignTarget.id, {
        maxCourses: maxCourses ? Number(maxCourses) : undefined,
        maxStudents: maxStudents ? Number(maxStudents) : undefined,
        storageGB: storageGB ? Number(storageGB) : undefined,
      });
    },
    onSuccess: () => {
      setAssignTarget(null);
      setMaxCourses("");
      setMaxStudents("");
      setStorageGB("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.academies });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });

  const loading = academiesQuery.isLoading || statsQuery.isLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const academies = academiesQuery.data ?? [];
  const stats = statsQuery.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Admin</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage academies and assign Enterprise plans.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.plan ?? "unknown"} className="p-4">
            <p className="text-sm text-text-secondary">
              {stat.plan ?? "Unassigned"}
            </p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {stat.count}
            </p>
            <p className="text-xs text-text-tertiary">academies</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">
                  Academy
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">
                  Owner
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">
                  Plan
                </th>
                <th className="px-4 py-3 text-center font-medium text-text-secondary">
                  Courses
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {academies.map((academy) => {
                const tier = academy.subscription?.plan?.tier;
                return (
                  <tr key={academy.id} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary">{academy.name}</td>
                    <td className="px-4 py-3">
                      <div className="text-text-primary">{academy.owner.name}</div>
                      <div className="text-text-tertiary text-xs">
                        {academy.owner.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[tierLabel(tier)] ?? TIER_STYLES.FREE}`}
                      >
                        {tierLabel(tier)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-text-primary">
                      {academy._count.courses}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setAssignTarget({
                            id: academy.id,
                            name: academy.name,
                          })
                        }
                      >
                        Assign Enterprise
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {assignTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Enterprise — {assignTarget.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Optional overrides. Leave blank to use plan defaults.
            </p>
            <Input
              label="Max courses"
              type="number"
              min={1}
              value={maxCourses}
              onChange={(e) => setMaxCourses(e.target.value)}
            />
            <Input
              label="Max students per course"
              type="number"
              min={1}
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
            />
            <Input
              label="Storage (GB)"
              type="number"
              min={1}
              value={storageGB}
              onChange={(e) => setStorageGB(e.target.value)}
            />
            {assignMutation.isError ? (
              <p className="text-sm text-red-500">
                {(assignMutation.error as Error).message}
              </p>
            ) : null}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAssignTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                loading={assignMutation.isPending}
                onClick={() => assignMutation.mutate()}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
