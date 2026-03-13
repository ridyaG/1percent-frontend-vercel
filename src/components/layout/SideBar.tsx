import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Flame, Trophy, Bell, User, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api/auth';
import { getDefaultAvatar } from '../../lib/utils';

const navItems = [
  { to: '/',             icon: Home,    label: 'Feed' },
  { to: '/explore',      icon: Search,  label: 'Explore' },
  { to: '/streaks',      icon: Flame,   label: 'Streaks' },
  { to: '/challenges',   icon: Trophy,  label: 'Challenges' },
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
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* ── Logo ── */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-accent)', boxShadow: '0 0 16px rgba(255,92,0,0.4)' }}
          >
            <Flame size={16} color="#fff" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            1<span style={{ color: 'var(--color-accent)' }}>%</span> Better
          </span>
        </div>

        {/* ── Compose button ── */}
        <div className="px-4 pb-4">
          <button
            onClick={() => { openCompose(); if (sidebarOpen) toggleSidebar(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              boxShadow: '0 2px 10px var(--color-accent-glow)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* ── Nav ── */}
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
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom section ── */}
        <div className="px-3 pb-5 space-y-2">
          {/* Streak mini card */}
          {streak > 0 && (
            <div
              className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
              style={{ background: 'var(--color-accent-bg)', border: '1px solid rgba(255,92,0,0.15)' }}
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

          {/* User row */}
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <img src={avatar} className="w-7 h-7 rounded-full" alt="" />
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
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-subtle)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,64,64,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-subtle)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
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
