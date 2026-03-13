import { Menu, Bell, Plus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getDefaultAvatar } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useMediaQuery';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Feed',
  '/explore':       'Explore',
  '/streaks':       'Streaks',
  '/challenges':    'Challenges',
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

  const avatar     = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');
  const pageTitle  = PAGE_TITLES[location.pathname] ?? '1% Better';

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[220px] h-[60px] flex items-center justify-between px-4 z-30"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger – mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)')}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <h1
          className="text-base font-bold"
          style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
        >
          {isMobile ? pageTitle : ''}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Mobile compose shortcut */}
        {isMobile && (
          <button
            onClick={openCompose}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
            aria-label="New post"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{
              background: 'var(--color-accent)',
              borderColor: 'var(--color-bg)',
            }}
          />
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full overflow-hidden transition-all"
          style={{ border: '2px solid var(--color-border)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
          aria-label="Profile"
        >
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        </button>
      </div>
    </header>
  );
}
