import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts';

interface Post {
  id: string;
  liked: boolean;
  _count?: { likes: number };
  [key: string]: unknown;
}

function updatePostInCache(old: unknown, postId: string, liked: boolean): unknown {
  if (!old || typeof old !== 'object') return old;
  const data = old as Record<string, unknown>;

  // Paginated feed shape: { pages: [{ posts: [] }] }
  if (data.pages) {
    return {
      ...data,
      pages: (data.pages as Array<{ posts?: Post[] }>).map(page => ({
        ...page,
        posts: (page.posts || []).map((p: Post) =>
          p.id === postId
            ? { ...p, liked: !liked, _count: { ...p._count, likes: (p._count?.likes || 0) + (liked ? -1 : 1) } }
            : p
        ),
      })),
    };
  }

  // Flat array shape: Post[]
  if (Array.isArray(old)) {
    return (old as Post[]).map(p =>
      p.id === postId
        ? { ...p, liked: !liked, _count: { ...p._count, likes: (p._count?.likes || 0) + (liked ? -1 : 1) } }
        : p
    );
  }

  return old;
}

export function useLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? postsApi.unlike(postId) : postsApi.like(postId),

    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries();
      const previous = queryClient.getQueriesData({});

      // Update every cached query that might contain this post
      queryClient.setQueriesData({}, (old: unknown) => updatePostInCache(old, postId, liked));

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        (context.previous as Array<[unknown[], unknown]>).forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}
