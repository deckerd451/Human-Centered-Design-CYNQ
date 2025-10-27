import { useQuery, QueryKey, UseQueryResult } from '@tanstack/react-query';
export function useData<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: object
): UseQueryResult<T, Error> {
  const queryResult = useQuery<T, Error>({
    queryKey,
    queryFn,
    ...options,
  });
  return queryResult;
}