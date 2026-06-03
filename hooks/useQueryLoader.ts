/** True when the query has no data yet and is still loading or fetching. */
export function useQueryLoader(state: {
  isLoading: boolean;
  isPending: boolean;
  isFetching: boolean;
  data: unknown;
}): boolean {
  const hasData = state.data !== undefined && state.data !== null;
  return (
    state.isLoading ||
    state.isPending ||
    (!hasData && state.isFetching)
  );
}
