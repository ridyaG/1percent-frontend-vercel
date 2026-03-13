import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Flame, Trophy, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api/auth';

const navItems = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/explore', icon: Search, label: 'Explore' },
  { to: '/streaks', icon: Flame, label: 'Streaks' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {}
    }
    sessionStorage.clear();
    logout();
    navigate('/login');
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-[220px] h-screen flex flex-col p-6 z-50
                    transition-transform duration-300 md:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="mb-10 pl-2">
          <span
            className="text-5xl font-bold"
            style={{ color: 'var(--color-accent)' }}
          >
            1%
          </span>
          <span
            className="text-xs tracking-[3px] ml-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            BETTER
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => sidebarOpen && toggleSidebar()}
            >
              {({ isActive }) => (
                <span
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{
                    background: isActive ? 'var(--color-accent-bg)' : 'transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-border)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors mt-2 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <LogOut size={20} /> Log Out
        </button>

        {/* Streak card */}
        <div
          className="mt-4 text-center py-3 rounded-xl"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <span
            className="text-3xl font-bold"
            style={{ color: 'var(--color-accent)' }}
          >
            {user?.currentStreak || 0}
          </span>
          <span className="ml-1">🔥</span>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Day Streak
          </div>
        </div>
      </aside>
    </>
  );
}
