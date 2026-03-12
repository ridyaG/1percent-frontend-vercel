import { useEffect, useRef } from 'react';
import { useHomeFeed } from '../hooks/useFeed';
import PostCard from '../components/post/PostCard';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';
import type { Post } from '../types/post';

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();
  const openCompose = useUIStore((s) => s.openCompose);
  const user = useAuthStore((s) => s.user);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
      { threshold: 0.5 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const posts: Post[] = data?.pages.flatMap((page: unknown) => (page as { posts?: Post[] }).posts || []) ?? [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Compose box */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4 mb-4"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <img
          src={user?.avatarUrl || getDefaultAvatar(user?.username || 'user')}
          className="w-10 h-10 rounded-full"
          alt=""
        />
        <button
          onClick={openCompose}
          className="flex-1 text-left rounded-xl px-4 py-2.5 text-sm transition-colors"
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-muted)',
          }}
        >
          What did you improve today?
        </button>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 animate-pulse"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-border)' }} />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--color-border)' }} />
                  <div className="h-3 w-20 rounded" style={{ background: 'var(--color-border)' }} />
                </div>
              </div>
              <div className="h-4 w-full rounded mb-2" style={{ background: 'var(--color-border)' }} />
              <div className="h-4 w-3/4 rounded" style={{ background: 'var(--color-border)' }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✍️</div>
          <div className="mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Your feed is empty
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Follow people or share your first win!
          </div>
          <button
            onClick={openCompose}
            className="mt-4 px-6 py-2 font-semibold rounded-lg transition-colors"
            style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        posts.map((post: Post) => <PostCard key={post.id} post={post} />)
      )}

      <div
        ref={loadMoreRef}
        className="py-4 text-center text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {isFetchingNextPage ? 'Loading more...' : ''}
      </div>
    </div>
  );
}
