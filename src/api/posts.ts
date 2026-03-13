import api from './client';

export const postsApi = {
  create: (data: { content: string; postType: string }) =>
    api.post('/posts', data).then(r => r.data.data),

  getHomeFeed: (cursor?: string) =>
    api.get('/posts/feed/home', { params: { cursor, limit: 20 } }).then(r => r.data.data),

  getExploreFeed: (cursor?: string) =>
    api.get('/posts/feed/explore', { params: { cursor, limit: 20 } }).then(r => r.data.data),

  like: (postId: string) =>
    api.post(`/posts/${postId}/like`).then(r => r.data.data),

  unlike: (postId: string) =>
    api.delete(`/posts/${postId}/like`).then(r => r.data.data),

  getComments: (postId: string) =>
    api.get(`/posts/${postId}/comments`).then(r => r.data.data),

  addComment: (postId: string, data: { content: string; parentId?: string }) =>
    api.post(`/posts/${postId}/comments`, data).then(r => r.data.data),

  getUserPosts: (userId: string) =>
    api.get(`/users/${userId}/posts`).then(r => r.data.data),
};
 
