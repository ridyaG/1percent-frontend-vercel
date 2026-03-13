export const POST_TYPES = [
  { value: 'daily_win',  label: 'Daily Win',   icon: '🏆' },
  { value: 'milestone',  label: 'Milestone',   icon: '🎯' },
  { value: 'reflection', label: 'Reflection',  icon: '💭' },
  { value: 'challenge',  label: 'Challenge',   icon: '⚡' },
  { value: 'goal_update',   label: 'Goal Update',    icon: '📈' },
  { value: 'photo_progress', label: 'Photo Progress', icon: '📸' },
] as const;

export const FOCUS_AREAS = [
  'fitness', 'coding', 'reading', 'nutrition', 'mindfulness',
  'writing', 'music', 'art', 'learning', 'finance', 'sleep', 'meditation',
];

export const NOTIFICATION_ICONS: Record<string, string> = {
  like:             '❤️',
  comment:          '💬',
  reply:            '↩️',
  follow:           '👤',
  follow_request:   '🤝',
  mention:          '@',
  streak_milestone: '🔥',
  streak_reminder:  '⏰',
  badge_earned:     '🏅',
  post_milestone:   '🎉',
  challenge_invite: '🏆',
};
