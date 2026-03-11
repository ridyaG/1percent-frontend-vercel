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
      <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-2xl p-4 mb-4">
        <img
          src={user?.avatarUrl || getDefaultAvatar(user?.username || 'user')}
          className="w-10 h-10 rounded-full"
          alt=""
        />
        <button
          onClick={openCompose}
          className="flex-1 text-left text-gray-500 bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm hover:bg-[#222] transition-colors"
        >
          What did you improve today?
        </button>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-white/5 rounded mb-2" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✍️</div>
          <div className="text-gray-400 mb-2">Your feed is empty</div>
          <div className="text-gray-600 text-sm">Follow people or share your first win!</div>
          <button
            onClick={openCompose}
            className="mt-4 px-6 py-2 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020] transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        posts.map((post: Post) => <PostCard key={post.id} post={post} />)
      )}

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="py-4 text-center text-gray-600 text-sm">
        {isFetchingNextPage ? 'Loading more...' : ''}
      </div>
    </div>
  );
}