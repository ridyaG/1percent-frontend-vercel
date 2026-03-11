import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts';

interface Post {
  id: string;
  liked: boolean;
  _count?: { likes: number };
  [key: string]: unknown;
}

interface Page {
  posts?: Post[];
  [key: string]: unknown;
}

interface FeedData {
  pages?: Page[];
  [key: string]: unknown;
}

export function useLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? postsApi.unlike(postId) : postsApi.like(postId),

    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previous = queryClient.getQueriesData({ queryKey: ['feed'] });

      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: FeedData) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: Page) => ({
            ...page,
            posts: (page.posts || []).map((p: Post) =>
              p.id === postId
                ? {
                    ...p,
                    liked: !liked,
                    _count: { ...p._count, likes: (p._count?.likes || 0) + (liked ? -1 : 1) },
                  }
                : p
            ),
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context: { previous: Array<[unknown, unknown]> } | undefined) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key as unknown[], data);
        });
      }
    },
  });
}