import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { STALE_TIMES } from "@/lib/query-keys";

export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: STALE_TIMES.browse,
          gcTime: 10 * 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }),
);
