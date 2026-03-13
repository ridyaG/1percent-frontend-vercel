import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../api/notifications';
import { getDefaultAvatar } from '../lib/utils';
import { NOTIFICATION_ICONS } from '../lib/constants';
import type { Notification } from '../types/notification';
import { CheckCheck, Bell, Sparkles } from 'lucide-react';

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
    message:          'sent you a message',
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
        background: notif.isRead ? 'transparent' : 'color-mix(in srgb, var(--color-accent-bg) 72%, var(--color-surface) 28%)',
        borderBottom: '1px solid var(--color-border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = notif.isRead
          ? 'var(--color-hover)'
          : 'color-mix(in srgb, var(--color-accent-bg) 82%, var(--color-surface) 18%)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = notif.isRead
          ? 'transparent'
          : 'color-mix(in srgb, var(--color-accent-bg) 72%, var(--color-surface) 28%)';
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container relative">
      <div
        className="pointer-events-none absolute left-8 top-20 h-40 w-40 rounded-full blur-3xl animate-float-soft"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)', opacity: 0.3 }}
      />
      <div
        className="pointer-events-none absolute right-8 top-56 h-36 w-36 rounded-full blur-3xl animate-drift-sideways"
        style={{ background: 'color-mix(in srgb, var(--color-secondary) 16%, transparent)', opacity: 0.18 }}
      />

      <section className="page-hero animate-fade-in relative z-10">
        <div className="max-w-[760px]">
          <div className="eyebrow mb-3">
            <Sparkles size={14} />
            Signal center
          </div>
          <h2 className="type-section mb-2">Stay close to the moments that need your attention.</h2>
          <p className="section-copy">
            Track replies, follows, mentions, and milestones in one place so you can respond without losing momentum.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div
            className="glass-panel rounded-[20px] px-4 py-4 min-w-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
              Unread
            </div>
            <div className="mt-1 text-3xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
              {unreadCount}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Waiting on your attention
            </div>
          </div>
          <div
            className="glass-panel rounded-[20px] px-4 py-4 min-w-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
              Total
            </div>
            <div className="mt-1 text-3xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
              {notifications.length}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              In your activity stream
            </div>
          </div>
          <div
            className="glass-panel rounded-[20px] px-4 py-4 min-w-0"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 80%, white 20%), color-mix(in srgb, var(--color-accent-bg) 40%, var(--color-surface) 60%))',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
              Status
            </div>
            <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {unreadCount > 0 ? 'Action needed' : 'All clear'}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {unreadCount > 0 ? 'You have unread activity to review.' : 'Nothing urgent is waiting right now.'}
            </div>
          </div>
        </div>
      </section>

      <div
        className="card overflow-hidden relative z-10 max-w-[980px] mx-auto"
        style={{ borderRadius: 'calc(var(--radius-xl) + 4px)' }}
      >
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h2
                className="section-title"
                style={{ color: 'var(--color-text)' }}
              >
                Notifications
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Your latest activity, replies, follows, and reminders.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Replies', 'Mentions', 'Milestones'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      background: 'color-mix(in srgb, var(--color-surface) 78%, white 22%)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={markingAll}
              className="btn btn-ghost text-sm"
            >
              <CheckCheck size={15} />
              {markingAll ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </div>

        {isLoading ? (
          <NotifSkeleton />
        ) : notifications.length === 0 ? (
          <div className="p-5 md:p-6">
            <div
              className="empty-state"
              style={{
                minHeight: '220px',
                maxWidth: '760px',
                margin: '0 auto',
                background:
                  'radial-gradient(circle at top, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 24%), color-mix(in srgb, var(--color-surface) 92%, white 8%)',
              }}
            >
              <div
                className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] animate-float-soft"
                style={{
                  background: 'var(--color-accent-bg)',
                  color: 'var(--color-accent)',
                  boxShadow: '0 0 0 10px color-mix(in srgb, var(--color-accent) 8%, transparent)',
                }}
              >
                <Bell size={30} />
              </div>
              <div className="empty-state-title">No notifications yet</div>
              <div className="empty-state-desc">
                Interact with the community to start seeing replies, follows, and milestone updates here.
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {['Replies', 'Mentions', 'Milestones'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: 'color-mix(in srgb, var(--color-surface) 78%, white 22%)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
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
    </div>
  );
}
