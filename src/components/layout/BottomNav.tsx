import { NavLink } from 'react-router-dom';
import { Home, Search, Flame, Bell, User } from 'lucide-react';

const items = [
  { to: '/', icon: Home },
  { to: '/explore', icon: Search },
  { to: '/streaks', icon: Flame },
  { to: '/notifications', icon: Bell },
  { to: '/profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around py-2 z-50 md:hidden"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {items.map(({ to, icon: Icon }) => (
        <NavLink key={to} to={to}>
          {({ isActive }) => (
            <span
              className="p-2 rounded-lg block transition-colors"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            >
              <Icon size={22} />
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
