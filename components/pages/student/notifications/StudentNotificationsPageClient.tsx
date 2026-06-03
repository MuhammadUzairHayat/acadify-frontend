"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useQueryLoader } from "@/hooks/useQueryLoader";
import { useStudentNotifications } from "@/hooks/useStudent";
import type { StudentNotification } from "@/lib/types";

type FilterStatus = "ALL" | "UNREAD" | "READ";

const FILTER_OPTIONS: { id: FilterStatus; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "UNREAD", label: "Unread" },
  { id: "READ", label: "Read" },
];

export function StudentNotificationsPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const notificationFilters = useMemo(
    () => ({
      isRead:
        filter === "ALL" ? undefined : filter === "READ" ? ("true" as const) : ("false" as const),
      limit: 50,
    }),
    [filter],
  );

  const notificationsQuery = useStudentNotifications(notificationFilters);
  const listLoading = useQueryLoader(notificationsQuery);
  const pages = notificationsQuery.data;
  const listError = notificationsQuery.error;

  const notifications = pages?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = pages?.pages[0]?.unreadCount ?? 0;

  const displayError =
    error ||
    (listError instanceof Error
      ? listError.message
      : listError
        ? "Unable to load"
        : "");

  const invalidateNotifications = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["student", "notifications"],
    });
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.student.markNotificationRead(id);
      await invalidateNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to mark read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.student.deleteNotification(id);
      await invalidateNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete");
    }
  };

  const openNotification = async (notification: StudentNotification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="min-h-screen">
      <StudentPageHeader
        eyebrow="Inbox"
        title="Alerts"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up."}
      />

      <div className="px-6 md:px-8 py-8">
        <RevealOnScroll>
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_OPTIONS.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={filter === item.id ? "primary" : "outline"}
                className="rounded-xl"
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </RevealOnScroll>

        {displayError ? <p className="text-sm text-red-400 mb-4">{displayError}</p> : null}

        {listLoading ? (
          <PageLoader size="lg" className="min-h-[120px]" />
        ) : notifications.length === 0 ? (
          <RevealOnScroll>
            <div className="rounded-xl border border-border-subtle bg-surface/40 text-center py-12">
              <p className="text-sm text-text-secondary">No alerts.</p>
            </div>
          </RevealOnScroll>
        ) : (
          <RevealGroup className="space-y-3" stagger={60}>
            {notifications.map((notification, index) => (
              <RevealItem key={notification.id} index={index}>
                <div
                  className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    notification.isRead
                      ? "border-border-subtle bg-surface/30"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    className="text-left flex-1 min-w-0"
                    onClick={() => void openNotification(notification)}
                  >
                    <p className="font-semibold text-text-primary text-sm">{notification.title}</p>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-2 uppercase tracking-wide">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex gap-2 shrink-0">
                    {!notification.isRead ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => void handleMarkRead(notification.id)}
                      >
                        Read
                      </Button>
                    ) : null}
                    <Button
                      variant="danger"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void handleDelete(notification.id)}
                    >
                      Delete
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
