import { Menu, Bell } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getDefaultAvatar } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[220px] h-[60px] backdrop-blur-md flex items-center justify-between px-4 z-30"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>
          1PERCENT
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Bell size={20} />
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-accent)' }}
          />
        </button>
        <button onClick={() => navigate('/profile')}>
          <img
            src={avatar}
            className="w-8 h-8 rounded-full"
            style={{ border: '1px solid var(--color-border)' }}
            alt=""
          />
        </button>
      </div>
    </header>
  );
}
