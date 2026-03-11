import { http, HttpResponse } from 'msw';
import type { Post } from '../types/post';

const mockPost: Post = {
  id: '1',
  content: 'Day 14! Staying consistent #coding',
  postType: 'daily_win',
  publishedAt: new Date().toISOString(),
  liked: false,

  author: {
    id: 'user1',
    username: 'alex',
    displayName: 'Alex',
    avatarUrl: '/avatar.png',
    currentStreak: 14,
  },

  _count: {
    likes: 5,
    comments: 2,
  },
};

export const handlers = [
  http.get('/api/v1/posts/feed/home', () => {
    return HttpResponse.json({
      success: true,
      data: {
        posts: [mockPost],
        nextCursor: null,
        hasMore: false,
      },
    });
  }),

  http.post('/api/v1/posts/:id/like', () => {
    return HttpResponse.json({
      success: true,
      data: { liked: true },
    });
  }),
];