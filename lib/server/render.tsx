import { dehydrate, type QueryClient } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { QueryHydration } from "@/components/providers/QueryHydration";

export async function renderPrefetched(
  prefetch: (qc: QueryClient) => Promise<void>,
  children: React.ReactNode,
) {
  const queryClient = getQueryClient();
  await prefetch(queryClient);
  return (
    <QueryHydration state={dehydrate(queryClient)}>{children}</QueryHydration>
  );
}
