import { useState, useRef, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import ThemePicker from './ThemePicker';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeFloating() {
  const [open, setOpen] = useState(false);
  const panelRef        = useRef<HTMLDivElement>(null);
  const { getCurrentThemeObject } = useThemeStore();
  const currentTheme = getCurrentThemeObject();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
    >
      {/* Picker panel */}
      {open && (
        <div
          className="w-[260px] rounded-2xl shadow-xl overflow-hidden animate-scale-in"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Appearance
            </span>
            <button
              onClick={() => setOpen(false)}
              className="w-5 h-5 flex items-center justify-center rounded-md"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={12} />
            </button>
          </div>
          <ThemePicker />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg"
        style={{
          background: open ? 'var(--color-accent)' : 'var(--color-surface)',
          border: `2px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}`,
          color: open ? '#fff' : 'var(--color-text-muted)',
          boxShadow: open ? '0 4px 20px var(--color-accent-glow)' : '0 2px 12px rgba(0,0,0,0.3)',
        }}
        title={`Theme: ${currentTheme.emoji} ${currentTheme.label}`}
        aria-label="Toggle theme picker"
      >
        <Palette size={17} />
      </button>
    </div>
  );
}
