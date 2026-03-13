import { NavLink } from 'react-router-dom';
import { Home, Search, Flame, Bell, User } from 'lucide-react';

const items = [
  { to: '/',              icon: Home,  label: 'Feed' },
  { to: '/explore',       icon: Search,label: 'Explore' },
  { to: '/streaks',       icon: Flame, label: 'Streaks' },
  { to: '/notifications', icon: Bell,  label: 'Alerts' },
  { to: '/profile',       icon: User,  label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center z-50 md:hidden"
      style={{
        background: 'color-mix(in srgb, var(--color-surface) 95%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '62px',
      }}
    >
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'}>
          {({ isActive }) => (
            <span
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                minWidth: 48,
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px var(--color-accent-glow))' : undefined,
                }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ opacity: isActive ? 1 : 0.7 }}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-6 h-0.5 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
