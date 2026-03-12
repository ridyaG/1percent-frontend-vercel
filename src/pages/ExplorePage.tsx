import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Hash } from 'lucide-react';
import api from '../api/client';
import PostCard from '../components/post/PostCard';
import { getDefaultAvatar } from '../lib/utils';
import type { Post } from '../types/post';

interface UserResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  currentStreak: number;
  bio?: string;
}

interface TrendingTag {
  tag: string;
  count: number;
}

const searchApi = {
  search: (q: string, type: string) =>
    api.get('/search', { params: { q, type } }).then(r => r.data.data),
  trending: () =>
    api.get('/search/trending').then(r => r.data.data as TrendingTag[]),
  recentPosts: () =>
    api.get('/search/recent-posts').then(r => r.data.data as Post[]),
};

function UserCard({ user }: { user: UserResult }) {
  return (
    <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      <img
        src={user.avatarUrl || getDefaultAvatar(user.username)}
        className="w-11 h-11 rounded-full"
        alt=""
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {user.displayName}
          <span className="text-gray-500 font-normal ml-1">@{user.username}</span>
        </div>
        {user.bio && <div className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</div>}
      </div>
      <div className="text-sm font-bold text-[#FF5C00] shrink-0">{user.currentStreak}🔥</div>
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-2xl px-4 py-3 mb-4 focus-within:border-[#FF5C00]/50 transition-colors">
        <Search size={18} className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search people, posts, hashtags..."
          className="flex-1 bg-transparent text-white outline-none text-sm placeholder-gray-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setDebouncedQuery(''); }}
            className="text-gray-500 hover:text-white text-xs"
          >✕</button>
        )}
      </div>

      {/* Search type tabs */}
      {isSearching && (
        <div className="flex gap-1 bg-[#111] border border-white/5 rounded-xl p-1 mb-4">
          {(['posts', 'users', 'hashtags'] as const).map(t => (
            <button key={t} onClick={() => setSearchType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors
                ${searchType === t ? 'bg-[#FF5C00] text-white' : 'text-gray-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* SEARCHING STATE */}
      {isSearching ? (
        <div>
          {searching ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 animate-pulse h-24" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">🔍</div>
              <div>No results for "{debouncedQuery}"</div>
              <div className="text-sm text-gray-600 mt-1">Try a different search term</div>
            </div>
          ) : searchType === 'users' ? (
            <div className="space-y-2">
              {(searchResults as UserResult[]).map(u => <UserCard key={u.id} user={u} />)}
            </div>
          ) : (
            (searchResults as Post[]).map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      ) : (
        /* DEFAULT STATE */
        <div>
          {/* Trending hashtags */}
          {trending.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#FF5C00]" />
                <h3 className="font-bold text-sm">Trending This Week</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map(({ tag, count }) => (
                  <button key={tag} onClick={() => handleHashtagClick(tag)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/5
                               rounded-full text-sm hover:border-[#FF5C00]/50 hover:text-[#FF5C00] transition-colors">
                    <Hash size={12} className="text-[#FF5C00]" />
                    {tag}
                    <span className="text-gray-600 text-xs ml-1">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent posts */}
          <div>
            <h3 className="font-bold text-sm mb-3">Recent Posts</h3>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">✍️</div>
                <div>No posts yet — be the first!</div>
              </div>
            ) : (
              recentPosts.map(p => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
