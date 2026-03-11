import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ExplorePage() {
  const [query, setQuery] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl px-4 py-3 mb-6">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, posts, hashtags..."
          className="flex-1 bg-transparent text-white outline-none text-sm placeholder-gray-500"
        />
      </div>

      <div className="text-center py-16 text-gray-500">
        <div className="text-4xl mb-4">🔍</div>
        <div>Explore is coming soon</div>
        <div className="text-sm text-gray-600 mt-1">Search for people and trending topics</div>
      </div>
    </div>
  );
}