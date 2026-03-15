import { Menu, Bell, Plus, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { notificationsApi } from '../../api/notifications';
import { getDefaultAvatar } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useMediaQuery';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Feed',
  '/explore':       'Explore',
  '/streaks':       'Streaks',
  '/challenges':    'Challenges',
  '/chat':          'Messages',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
};

export default function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openCompose   = useUIStore((s) => s.openCompose);
  const user          = useAuthStore((s) => s.user);
  const navigate      = useNavigate();
  const location      = useLocation();
  const isMobile      = useIsMobile();
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const avatar     = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');
  const pageTitle  = PAGE_TITLES[location.pathname] ?? '1% Better';

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[220px] z-30"
      style={{
        height: 'var(--topbar-height)',
        background: 'color-mix(in srgb, var(--color-bg) 76%, transparent)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid rgba(169, 190, 255, 0.08)',
        boxShadow: '0 12px 32px rgba(2, 6, 23, 0.14)',
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 'var(--tap-target)',
              height: 'var(--tap-target)',
              color: 'var(--color-text)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
            }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <div className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: 'var(--color-secondary)' }}>
              1% Better
            </div>
            <h1
              className="truncate text-lg font-bold sm:text-[1.45rem]"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isMobile && (
            <button
              onClick={openCompose}
              className="btn btn-primary hidden sm:inline-flex"
              aria-label="Create post"
            >
              <Plus size={16} />
              New post
            </button>
          )}

          {isMobile && (
            <button
              onClick={openCompose}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 'var(--tap-target)',
                height: 'var(--tap-target)',
                background: 'var(--gradient-brand)',
                color: '#fff',
                boxShadow: '0 14px 26px rgba(255,122,24,0.22)',
              }}
              aria-label="New post"
            >
              <Plus size={18} />
            </button>
          )}

          <button
            onClick={() => navigate('/chat')}
            className="relative flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 'var(--tap-target)',
              height: 'var(--tap-target)',
              color: 'var(--color-text)',
              background: location.pathname === '/chat' ? 'var(--color-accent-bg)' : 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
            }}
            aria-label="Messages"
          >
            <MessageCircle size={18} />
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="relative flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 'var(--tap-target)',
              height: 'var(--tap-target)',
              color: 'var(--color-text)',
              background: location.pathname === '/notifications' ? 'var(--color-accent-bg)' : 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: '2px solid var(--color-bg)',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="overflow-hidden rounded-full transition-all"
            style={{
              width: 'var(--tap-target)',
              height: 'var(--tap-target)',
              border: location.pathname === '/profile' ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
              boxShadow: location.pathname === '/profile' ? '0 0 0 4px rgba(255,122,24,0.12)' : 'none',
            }}
            aria-label="Profile"
          >
            <img src={avatar} className="h-full w-full object-cover" alt="" />
          </button>
        </div>
      </div>
    </header>
  );
}
