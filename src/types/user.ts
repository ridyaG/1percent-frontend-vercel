export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  websiteUrl?: string;
  location?: string;
  goalStatement?: string;
  focusAreas?: string[];
  isPrivate?: boolean;
  isVerified?: boolean;
  currentStreak: number;
  longestStreak?: number;
  streakFreezeCount?: number;
  lastPostDate?: string;
  createdAt?: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}
