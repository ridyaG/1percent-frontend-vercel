import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Hash, X, Compass, Sparkles } from 'lucide-react';
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
      <section className="page-hero animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow mb-3">
              <Compass size={14} />
              Discover
            </div>
            <h2 className="type-section mb-2">Find people, ideas, and momentum.</h2>
            <p className="section-copy">
              Search the community, jump into trending topics, and surface recent progress updates without losing context.
            </p>
          </div>
          <div className="glass-panel flex items-center gap-3 self-start px-4 py-3">
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Explore what people are improving this week.
            </div>
          </div>
        </div>
      </section>

      <div
        className="mb-4 flex items-center gap-3 rounded-[24px] px-4 py-3 transition-all"
        style={{
          background: 'var(--gradient-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
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
            className="rounded-full flex items-center justify-center transition-colors"
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* ── Search type tabs ── */}
      {isSearching && (
        <div
          className="flex gap-1 rounded-2xl p-1.5 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
        >
          {(['posts', 'users', 'hashtags'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSearchType(t)}
              className="flex-1 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                minHeight: '42px',
                background: searchType === t ? 'var(--gradient-brand)' : 'transparent',
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
                <h3 className="section-title">Trending This Week</h3>
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
            <h3 className="section-title mb-3">Recent Posts</h3>
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
