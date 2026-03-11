import { useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';

export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'home'],
    queryFn: ({ pageParam }) => postsApi.getHomeFeed(pageParam),
    getNextPageParam: (lastPage: { nextCursor?: string }) => lastPage?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExploreFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) => postsApi.getExploreFeed(pageParam),
    getNextPageParam: (lastPage: { nextCursor?: string }) => lastPage?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5,
  });
}