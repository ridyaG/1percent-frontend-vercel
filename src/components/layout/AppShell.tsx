import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import ComposeModal from '../post/ComposeModal';
import { useSocket } from '../../hooks/useSocket';
import { Toaster } from 'react-hot-toast';
import ThemeFloating from '../settings/ThemeFloating';
import { useIsMobile } from '../../hooks/useMediaQuery';
import FireCanvas from '../FireCanvas';

export default function AppShell() {
  const isMobile = useIsMobile();
  useSocket();

  return (
    <div
      className="flex min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Ambient fire — fixed behind UI, subtle */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.35 }}
        aria-hidden="true"
      >
        <FireCanvas sparkFreq={1} floorFrac={0.04} />
      </div>

      {/* All UI above fire */}
      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar />

        <main
          className="flex-1 md:ml-[220px] min-w-0"
          style={{ background: 'transparent' }}
        >
          <Topbar />
          {/* Content — padded for topbar; extra padding on mobile for bottom nav */}
          <div
            className="pt-[60px]"
            style={{ paddingBottom: isMobile ? '72px' : '0' }}
          >
            <Outlet />
          </div>
        </main>

        {isMobile && <BottomNav />}

        <ComposeModal />

        {/* Theme selector — desktop only */}
        {!isMobile && <ThemeFloating />}

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-accent)',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
