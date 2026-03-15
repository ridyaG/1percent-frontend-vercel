import { NavLink } from 'react-router-dom';
import { Home, Search, Flame, Bell, User, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { useAuthStore } from '../../store/authStore';

const items = [
  { to: '/',              icon: Home,  label: 'Feed' },
  { to: '/explore',       icon: Search,label: 'Explore' },
  { to: '/streaks',       icon: Flame, label: 'Streaks' },
  { to: '/chat',          icon: MessageCircle, label: 'Messages' },
  { to: '/notifications', icon: Bell,  label: 'Alerts' },
  { to: '/profile',       icon: User,  label: 'Profile' },
];

export default function BottomNav() {
  const user = useAuthStore(s => s.user);
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderTop: '1px solid rgba(169, 190, 255, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -14px 32px rgba(2, 6, 23, 0.22)',
      }}
    >
      <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-[640px] items-center justify-around gap-1 px-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <span
                className="relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2"
                style={{
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                  background: isActive ? 'linear-gradient(180deg, rgba(255,122,24,0.22), rgba(255,179,71,0.08))' : 'transparent',
                  minHeight: '52px',
                  boxShadow: isActive ? '0 10px 22px rgba(255,122,24,0.12)' : 'none',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.9}
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'currentColor',
                    filter: isActive ? 'drop-shadow(0 0 8px var(--color-accent-glow))' : undefined,
                  }}
                />
                <span className="text-[10px] font-semibold tracking-[0.03em]">
                  {label}
                </span>
                {isActive && (
                  <span
                    className="absolute top-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                  />
                )}
                {to === '/notifications' && unreadCount > 0 && (
                  <span
                    className="absolute right-2 top-1.5 min-w-4 rounded-full px-1 text-[9px] font-bold"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
