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
    <header className="fixed top-0 right-0 left-0 md:left-[220px] h-[60px] bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-30">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold tracking-wide">1PERCENT</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-gray-400 hover:text-white transition-colors"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF5C00] rounded-full" />
        </button>
        <button onClick={() => navigate('/profile')}>
          <img src={avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
        </button>
      </div>
    </header>
  );
}