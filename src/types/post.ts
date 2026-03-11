export interface Post {
  id: string;
  content: string;
  postType: string;
  mediaUrls?: string[];
  hashtags?: string[];
  publishedAt: string;

  liked?: boolean;

  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    currentStreak?: number;
  };

  _count?: {
    likes?: number;
    comments?: number;
  };
}