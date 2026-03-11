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
      try { await authApi.logout(refreshToken); } catch {// Logout API call failed, but we'll proceed with local logout
        }
    }
    sessionStorage.clear();
    logout();
    navigate('/login');
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        style={{
          transform: typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarOpen
            ? 'translateX(-100%)'
            : 'translateX(0)',
        }}
        className="fixed top-0 left-0 w-[220px] h-screen bg-[#111] border-r border-white/5 flex flex-col p-6 z-50 transition-transform duration-300 max-md:-translate-x-full md:translate-x-0"
      >
        <div className="mb-10 pl-2">
          <span className="text-5xl font-bold text-[#FF5C00]" style={{ textShadow: '0 0 30px rgba(255,92,0,0.25)' }}>
            1%
          </span>
          <span className="text-xs text-gray-600 tracking-[3px] ml-1">BETTER</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => sidebarOpen && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#FF5C00]/10 text-[#FF5C00]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-400 text-sm transition-colors mt-2"
        >
          <LogOut size={20} /> Log Out
        </button>

        <div className="mt-4 text-center py-3 bg-[#1a1a1a] rounded-xl">
          <span className="text-3xl font-bold text-[#FF5C00]">{user?.currentStreak || 0}</span>
          <span className="ml-1">🔥</span>
          <div className="text-xs text-gray-500 mt-1">Day Streak</div>
        </div>
      </aside>
    </>
  );
}