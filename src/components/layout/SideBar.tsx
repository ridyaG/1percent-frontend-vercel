import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Flame, Trophy, Bell, User, LogOut, Plus, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api/auth';
import { notificationsApi } from '../../api/notifications';
import { getDefaultAvatar } from '../../lib/utils';

const navItems = [
  { to: '/',             icon: Home,    label: 'Feed' },
  { to: '/explore',      icon: Search,  label: 'Explore' },
  { to: '/streaks',      icon: Flame,   label: 'Streaks' },
  { to: '/challenges',   icon: Trophy,  label: 'Challenges' },
  { to: '/chat',         icon: MessageCircle, label: 'Messages' },
  { to: '/notifications',icon: Bell,    label: 'Alerts' },
  { to: '/profile',      icon: User,    label: 'Profile' },
];

export default function Sidebar() {
  const user          = useAuthStore((s) => s.user);
  const logout        = useAuthStore((s) => s.logout);
  const openCompose   = useUIStore((s) => s.openCompose);
  const sidebarOpen   = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate      = useNavigate();

  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');
  const streak = user?.currentStreak || 0;
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const handleLogout = async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {console.log('Failed to logout.');}
    }
    sessionStorage.clear();
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-[220px] h-screen flex flex-col z-50
                    transition-transform duration-300 ease-in-out md:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--gradient-surface)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: '20px 0 40px rgba(2, 6, 23, 0.26)',
        }}
      >
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 18px rgba(255,122,24,0.28)' }}
          >
            <Flame size={18} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--color-secondary)' }}>
              Build daily
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              1<span style={{ color: 'var(--color-accent)' }}>%</span> Better
            </span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={() => { openCompose(); if (sidebarOpen) toggleSidebar(); }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-semibold text-sm transition-all"
            style={{
              minHeight: '48px',
              background: 'var(--gradient-brand)',
              color: '#fff',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 px-3 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => sidebarOpen && toggleSidebar()}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === '/notifications' && unreadCount > 0 && (
                <span
                  className="ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-center"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-2">
          {streak > 0 && (
            <div
              className="rounded-2xl px-3 py-3 flex items-center gap-2.5"
              style={{
                background: 'color-mix(in srgb, var(--color-accent-bg) 75%, var(--color-surface) 25%)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Current Streak</div>
                <div className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>
                  {streak} day{streak !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          <div
            className="glass-panel flex items-center gap-2.5 px-3 py-3 rounded-2xl"
          >
            <img src={avatar} className="w-9 h-9 rounded-full" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {user?.displayName}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                @{user?.username}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex items-center justify-center rounded-xl transition-colors"
              style={{
                width: 'var(--tap-target)',
                height: 'var(--tap-target)',
                color: 'var(--color-text-subtle)',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
