import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Topbar from './Topbar';
import ComposeModal from '../post/ComposeModal';
import { Plus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSocket } from '../../hooks/useSocket';
import { Toaster } from 'react-hot-toast';

export default function AppShell() {
  const openCompose = useUIStore((s) => s.openCompose);
  useSocket(); // Connect WebSocket

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="flex-1 md:ml-[220px]">
        <Topbar />
        <div className="pt-[60px]">
          <Outlet />
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={openCompose}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF5C00] text-white flex items-center justify-center shadow-lg shadow-[#FF5C00]/25 hover:scale-110 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      <ComposeModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />
    </div>
  );
}