import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Hash } from 'lucide-react';
import api from '../api/client';
import PostCard from '../components/post/PostCard';
import { getDefaultAvatar } from '../lib/utils';
import type { Post } from '../types/post';

interface UserResult {
  id: string; username: string; displayName: string;
  avatarUrl?: string; currentStreak: number; bio?: string;
}
interface TrendingTag { tag: string; count: number; }

const searchApi = {
  search: (q: string, type: string) => api.get('/search', { params: { q, type } }).then(r => r.data.data),
  trending: () => api.get('/search/trending').then(r => r.data.data as TrendingTag[]),
  recentPosts: () => api.get('/search/recent-posts').then(r => r.data.data as Post[]),
};

function UserCard({ user }: { user: UserResult }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4 transition-colors"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <img src={user.avatarUrl || getDefaultAvatar(user.username)} className="w-11 h-11 rounded-full" alt="" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
          {user.displayName}
          <span className="font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>@{user.username}</span>
        </div>
        {user.bio && <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{user.bio}</div>}
      </div>
      <div className="text-sm font-bold shrink-0" style={{ color: 'var(--color-accent)' }}>{user.currentStreak}🔥</div>
    </div>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<'posts' | 'users' | 'hashtags'>('posts');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 0;

  const { data: recentPosts = [] } = useQuery({ queryKey: ['explore-recent'], queryFn: searchApi.recentPosts, enabled: !isSearching });
  const { data: trending = [] } = useQuery({ queryKey: ['explore-trending'], queryFn: searchApi.trending, enabled: !isSearching });
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['search', debouncedQuery, searchType],
    queryFn: () => searchApi.search(debouncedQuery, searchType),
    enabled: isSearching,
  });

  const handleHashtagClick = (tag: string) => { setQuery(`#${tag}`); setSearchType('hashtags'); };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 transition-colors"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <Search size={18} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search people, posts, hashtags..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }} />
        {query && (
          <button onClick={() => { setQuery(''); setDebouncedQuery(''); }}
            className="text-xs" style={{ color: 'var(--color-text-muted)' }}>✕</button>
        )}
      </div>

      {/* Search type tabs */}
      {isSearching && (
        <div className="flex gap-1 rounded-xl p-1 mb-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {(['posts', 'users', 'hashtags'] as const).map(t => (
            <button key={t} onClick={() => setSearchType(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors"
              style={{
                background: searchType === t ? 'var(--color-accent)' : 'transparent',
                color: searchType === t ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
              }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {isSearching ? (
        <div>
          {searching ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl p-5 animate-pulse h-24"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl mb-3">🔍</div>
              <div>No results for "{debouncedQuery}"</div>
              <div className="text-sm mt-1" style={{ opacity: 0.6 }}>Try a different search term</div>
            </div>
          ) : searchType === 'users' ? (
            <div className="space-y-2">{(searchResults as UserResult[]).map(u => <UserCard key={u.id} user={u} />)}</div>
          ) : (
            (searchResults as Post[]).map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      ) : (
        <div>
          {trending.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: 'var(--color-accent)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Trending This Week</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map(({ tag, count }) => (
                  <button key={tag} onClick={() => handleHashtagClick(tag)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                    <Hash size={12} style={{ color: 'var(--color-accent)' }} />
                    {tag}
                    <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Recent Posts</h3>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-4xl mb-3">✍️</div>
                <div>No posts yet — be the first!</div>
              </div>
            ) : recentPosts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
