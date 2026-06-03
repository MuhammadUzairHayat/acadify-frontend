"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apis";
import { queryKeys, STALE_TIMES } from "@/lib/query-keys";
import type { User } from "@/lib/types";

type ProfileResponse = {
  data?: { user: User };
  user?: User;
};

export function useAuthProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: async () => {
      const res = (await api.auth.getProfile()) as ProfileResponse;
      return (res.data?.user ?? res.user ?? null) as User | null;
    },
    staleTime: STALE_TIMES.profile,
  });
}
