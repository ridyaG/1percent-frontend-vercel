import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Topbar from './Topbar';
import ComposeModal from '../post/ComposeModal';
import { Plus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSocket } from '../../hooks/useSocket';
import { Toaster } from 'react-hot-toast';
import ThemeFloating from '../settings/ThemeFloating';

export default function AppShell() {
  const openCompose = useUIStore((s) => s.openCompose);
  useSocket();

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
        style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
      >
        <Plus size={24} />
      </button>

      <ComposeModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <ThemeFloating />
    </div>
  );
}
