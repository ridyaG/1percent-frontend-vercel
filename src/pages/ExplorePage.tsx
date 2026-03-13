import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Hash, X } from 'lucide-react';
import api from '../api/client';
import PostCard from '../components/post/PostCard';
import { getDefaultAvatar } from '../lib/utils';
import type { Post } from '../types/post';
import StreakBadge from '../components/profile/StreakBadge';

interface UserResult {
  id: string; username: string; displayName: string;
  avatarUrl?: string; currentStreak: number; bio?: string;
}
interface TrendingTag { tag: string; count: number; }

const searchApi = {
  search:      (q: string, type: string) => api.get('/search', { params: { q, type } }).then(r => r.data.data),
  trending:    () => api.get('/search/trending').then(r => r.data.data as TrendingTag[]),
  recentPosts: () => api.get('/search/recent-posts').then(r => r.data.data as Post[]),
};

function UserCard({ user }: { user: UserResult }) {
  return (
    <div
      className="card flex items-center gap-3 p-4"
      style={{ borderRadius: 'var(--radius-lg)', marginBottom: 8 }}
    >
      <img
        src={user.avatarUrl || getDefaultAvatar(user.username)}
        className="avatar avatar-lg"
        alt=""
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
          {user.displayName}
          <span className="font-normal ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            @{user.username}
          </span>
        </div>
        {user.bio && (
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
            {user.bio}
          </div>
        )}
      </div>
      <StreakBadge streak={user.currentStreak} />
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const [query,          setQuery]          = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType,     setSearchType]     = useState<'posts' | 'users' | 'hashtags'>('posts');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 0;

  const { data: recentPosts = [] } = useQuery({
    queryKey: ['explore-recent'],
    queryFn: searchApi.recentPosts,
    enabled: !isSearching,
  });
  const { data: trending = [] } = useQuery({
    queryKey: ['explore-trending'],
    queryFn: searchApi.trending,
    enabled: !isSearching,
  });
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['search', debouncedQuery, searchType],
    queryFn: () => searchApi.search(debouncedQuery, searchType),
    enabled: isSearching,
  });

  const handleHashtagClick = (tag: string) => {
    setQuery(`#${tag}`);
    setSearchType('hashtags');
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className="page-container">
      {/* ── Search bar ── */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 transition-all"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--color-accent-bg)';
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <Search size={17} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search people, posts, #hashtags..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* ── Search type tabs ── */}
      {isSearching && (
        <div
          className="flex gap-1 rounded-xl p-1 mb-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {(['posts', 'users', 'hashtags'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSearchType(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: searchType === t ? 'var(--color-accent)' : 'transparent',
                color: searchType === t ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {isSearching ? (
        searching ? (
          <SearchSkeleton />
        ) : (searchResults as unknown[]).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No results found</div>
            <div className="empty-state-desc">Try a different search term or hashtag</div>
          </div>
        ) : searchType === 'users' ? (
          <div>
            {(searchResults as UserResult[]).map(u => <UserCard key={u.id} user={u} />)}
          </div>
        ) : (
          (searchResults as Post[]).map(p => <PostCard key={p.id} post={p} />)
        )
      ) : (
        <div>
          {/* Trending */}
          {(trending as TrendingTag[]).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} style={{ color: 'var(--color-accent)' }} />
                <h3
                  className="font-bold text-sm"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
                >
                  Trending This Week
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(trending as TrendingTag[]).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleHashtagClick(tag)}
                    className="tag tag-accent flex items-center gap-1"
                  >
                    <Hash size={11} />
                    {tag}
                    <span
                      className="ml-1 text-xs font-normal"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent posts */}
          <div>
            <h3
              className="font-bold text-sm mb-3"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              Recent Posts
            </h3>
            {(recentPosts as Post[]).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✍️</div>
                <div className="empty-state-title">No posts yet</div>
                <div className="empty-state-desc">Be the first to post!</div>
              </div>
            ) : (
              (recentPosts as Post[]).map(p => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
