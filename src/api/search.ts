import api from './client';

export const searchApi = {
  search: (query: string, type: string = 'posts') =>
    api.get('/search', { params: { q: query, type } }).then(r => r.data.data),
};