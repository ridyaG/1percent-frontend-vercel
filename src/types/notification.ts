export type NotificationType =
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'follow_request'
  | 'mention'
  | 'streak_milestone'
  | 'streak_reminder'
  | 'badge_earned'
  | 'post_milestone'
  | 'challenge_invite';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;
  actor?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}
