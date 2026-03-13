import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../api/notifications';
import { getDefaultAvatar } from '../lib/utils';
import { NOTIFICATION_ICONS } from '../lib/constants';
import type { Notification } from '../types/notification';
import { CheckCheck } from 'lucide-react';

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const actor = notif.actor;
  const icon  = NOTIFICATION_ICONS[notif.type] || '🔔';
  const time  = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true });

  const label: Record<string, string> = {
    like:             'liked your post',
    comment:          'commented on your post',
    reply:            'replied to your comment',
    follow:           'started following you',
    follow_request:   'sent you a follow request',
    mention:          'mentioned you in a post',
    streak_milestone: 'reached a streak milestone!',
    streak_reminder:  "don't forget to post today!",
    badge_earned:     'you earned a new badge!',
    post_milestone:   'your post hit a milestone!',
    challenge_invite: 'invited you to a challenge',
  };

  return (
    <div
      onClick={() => !notif.isRead && onRead(notif.id)}
      className="flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer"
      style={{
        background: notif.isRead ? 'transparent' : 'var(--color-accent-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = notif.isRead
          ? 'var(--color-hover)'
          : 'rgba(255,92,0,0.16)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = notif.isRead
          ? 'transparent'
          : 'var(--color-accent-bg)';
      }}
    >
      {actor ? (
        <img
          src={actor.avatarUrl || getDefaultAvatar(actor.username)}
          className="avatar avatar-md shrink-0 mt-0.5"
          alt={actor.displayName}
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
          {actor && (
            <span className="font-semibold">{actor.displayName} </span>
          )}
          <span style={{ color: 'var(--color-text-muted)' }}>
            {label[notif.type] ?? notif.type}
          </span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>
          {time}
        </p>
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

function NotifSkeleton() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-2 w-1/4" />
          </div>
        </div>
      ))}
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Sticky header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 sticky top-[60px] z-10"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <h2
            className="font-bold text-lg"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-accent)' }}
          >
            <CheckCheck size={14} />
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <NotifSkeleton />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">No notifications yet</div>
          <div className="empty-state-desc">
            Interact with the community to start seeing updates here.
          </div>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotifItem key={n.id} notif={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
