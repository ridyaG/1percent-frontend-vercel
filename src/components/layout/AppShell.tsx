import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import ComposeModal from '../post/ComposeModal';
import { Plus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSocket } from '../../hooks/useSocket';
import { Toaster } from 'react-hot-toast';
import ThemeFloating from '../settings/ThemeFloating';
import { useIsMobile } from '../../hooks/useMediaQuery';
import FireCanvas from '../FireCanvas';

export default function AppShell() {
  const openCompose = useUIStore((s) => s.openCompose);
  const isMobile = useIsMobile();
  useSocket();

  return (
    <div
      className="flex min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* ── Ambient fire — fixed behind all UI, subtle opacity ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.45 }}>
        <FireCanvas sparkFreq={1} floorFrac={0.04} />
      </div>

      {/* ── All UI above the fire ── */}
      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar />

        <main className="flex-1 md:ml-[220px]">
          <Topbar />
          <div className={`pt-[60px] ${isMobile ? 'pb-[60px]' : ''}`}>
            <Outlet />
          </div>
        </main>

        {!isMobile && (
          <button
            onClick={openCompose}
            className="fixed bottom-6 right-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
            style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
            title="New Post (N)"
          >
            <Plus size={24} />
          </button>
        )}

        {isMobile && <BottomNav />}
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

        {!isMobile && <ThemeFloating />}
      </div>
    </div>
  );
}
