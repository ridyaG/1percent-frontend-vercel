import { useQuery } from '@tanstack/react-query';
import { useState, useDeferredValue } from 'react';
import { searchApi } from '../api/search';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'posts' | 'users' | 'hashtags'>('posts');
  const debouncedQuery = useDeferredValue(query);

  const results = useQuery({
    queryKey: ['search', debouncedQuery, tab],
    queryFn: () => searchApi.search(debouncedQuery, tab),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
  });

  return { query, setQuery, tab, setTab, ...results };
}
