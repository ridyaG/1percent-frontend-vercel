import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../api/notifications';
import { getDefaultAvatar } from '../lib/utils';
import { NOTIFICATION_ICONS } from '../lib/constants';
import type { Notification } from '../types/notification';

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const actor = notif.actor;
  const icon = NOTIFICATION_ICONS[notif.type] || '🔔';
  const time = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true });

  const label = {
    like:             'liked your post',
    comment:          'commented on your post',
    reply:            'replied to your comment',
    follow:           'started following you',
    follow_request:   'sent you a follow request',
    mention:          'mentioned you in a post',
    streak_milestone: 'streak milestone reached!',
    streak_reminder:  "don't forget to post today!",
    badge_earned:     'you earned a new badge!',
    post_milestone:   'your post hit a milestone!',
    challenge_invite: 'invited you to a challenge',
  }[notif.type] ?? notif.type;

  return (
    <div
      onClick={() => !notif.isRead && onRead(notif.id)}
      className="flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer"
      style={{
        background: notif.isRead ? 'transparent' : 'var(--color-accent-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Avatar or icon */}
      {actor ? (
        <img
          src={actor.avatarUrl || getDefaultAvatar(actor.username)}
          className="w-10 h-10 rounded-full shrink-0 mt-0.5"
          alt={actor.displayName}
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
          style={{ background: 'var(--color-surface)' }}
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
          {actor && (
            <span className="font-semibold">{actor.displayName} </span>
          )}
          {label}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{time}</p>
      </div>

      {!notif.isRead && (
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-2"
          style={{ background: 'var(--color-accent)' }}
        />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    staleTime: 1000 * 30,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 sticky top-[60px] z-10 backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          Notifications
        </h2>
        {hasUnread && (
          <button
            onClick={() => markAllRead()}
            disabled={markingAll}
            className="text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-accent)' }}
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-5 py-4 animate-pulse"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="w-10 h-10 rounded-full shrink-0" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-2/3 rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-2 w-1/4 rounded" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-5xl mb-4">🔔</div>
          <div className="font-semibold">No notifications yet</div>
          <div className="text-sm mt-2 opacity-60">
            Interact with the community to see updates here
          </div>
        </div>
      ) : (
        <div>
          {notifications.map(n => (
            <NotifItem key={n.id} notif={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
