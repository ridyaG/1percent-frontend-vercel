import { useEffect, useRef } from 'react';
import { useHomeFeed } from '../hooks/useFeed';
import PostCard from '../components/post/PostCard';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';
import type { Post } from '../types/post';
import { Flame, Pencil } from 'lucide-react';

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-2 w-20" />
            </div>
          </div>
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton h-3 w-3/4 mb-4" />
          <div className="skeleton h-2 w-2/4" />
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();
  const openCompose = useUIStore((s) => s.openCompose);
  const user        = useAuthStore((s) => s.user);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const posts: Post[] =
    data?.pages.flatMap((page: unknown) => (page as { posts?: Post[] }).posts || []) ?? [];

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
      { threshold: 0.3 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');
  const streak = user?.currentStreak || 0;

  return (
    <div className="page-container">
      <section className="page-hero animate-fade-in">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow mb-3">
              <Flame size={14} />
              Daily momentum
            </div>
            <h2 className="type-section mb-2">Keep your momentum visible.</h2>
            <p className="section-copy">
              Share small wins, track consistency, and make progress feel rewarding every time you open the feed.
            </p>
          </div>

          <div className="glass-panel flex items-center gap-3 self-start px-4 py-3 sm:self-auto">
            <img src={avatar} className="avatar avatar-md" alt="" />
            <div>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                Today&apos;s check-in
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                One small improvement counts.
              </div>
            </div>
          </div>
        </div>
      </section>

      {streak > 0 && (
        <div
        className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-4"
        style={{
          background: 'color-mix(in srgb, var(--color-accent-bg) 75%, var(--color-surface) 25%)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
        >
          <Flame size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Day {streak} Streak!
            </span>
            <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)' }}>
              Keep the momentum going.
            </span>
          </div>
        </div>
      )}

      <button
        onClick={openCompose}
        className="w-full flex items-center gap-3 rounded-[24px] p-4 mb-5 text-left transition-all"
        style={{
          background: 'var(--gradient-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <img src={avatar} className="avatar avatar-md" alt="" />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
            Share a win
          </div>
          <span
            className="block text-sm"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            What did you improve today?
          </span>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl shrink-0"
          style={{ background: 'var(--gradient-brand)', color: '#fff', minHeight: '40px' }}
        >
          <Pencil size={12} /> Post
        </span>
      </button>

      {isLoading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <div className="empty-state-title">Your feed is empty</div>
          <div className="empty-state-desc mb-4">
            Follow people or share your first win to get started!
          </div>
          <button onClick={openCompose} className="btn btn-primary">
            Create Your First Post 🔥
          </button>
        </div>
      ) : (
        <>
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-6 flex justify-center">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading more...
              </div>
            ) : hasNextPage ? (
              <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                Scroll to load more
              </span>
            ) : posts.length > 0 ? (
              <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                You're all caught up 🎉
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
