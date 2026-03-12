import { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useThemeStore, themes, type ThemeName } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

export default function ThemeFloating() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore(s => s.user);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 w-72 rounded-2xl p-4 shadow-2xl"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              Choose Theme
            </span>
            <button onClick={() => setOpen(false)}>
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(themes) as [ThemeName, typeof themes[ThemeName]][]).map(([key, t]) => (
              <button
                key={key}
                onClick={() => { setTheme(key, user?.id); setOpen(false); }}
                className="text-left rounded-xl p-3 transition-all"
                style={{
                  background: t.bg,
                  border: `2px solid ${theme === key ? t.accent : t.border}`,
                }}
              >
                {/* Swatches */}
                <div style={{ display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden', marginBottom: 6, gap: 2 }}>
                  <div style={{ flex: 1, background: t.bg }} />
                  <div style={{ flex: 1, background: t.surface }} />
                  <div style={{ flex: 1, background: t.accent }} />
                  <div style={{ flex: 1, background: t.textMuted }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: t.text }}>
                  {t.emoji} {t.label}
                </div>
                {theme === key && (
                  <div style={{ fontSize: 10, color: t.accent, marginTop: 1 }}>✓ Active</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-4 z-50 w-12 h-12 rounded-full
                   flex items-center justify-center shadow-lg transition-transform
                   hover:scale-110 active:scale-95"
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-accent-text)',
        }}
      >
        <Palette size={20} />
      </button>
    </>
  );
}
