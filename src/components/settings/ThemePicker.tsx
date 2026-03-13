import { useThemeStore, themes, type ThemeName } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Check } from 'lucide-react';

export default function ThemePicker() {
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore(s => s.user);

  return (
    <div className="p-4">
      <h3
        className="font-bold text-sm mb-1"
        style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
      >
        Theme
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Choose your vibe
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {(Object.entries(themes) as [ThemeName, typeof themes[ThemeName]][]).map(([key, t]) => {
          const isActive = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key, user?.id)}
              style={{
                background: t.surface,
                border: `2px solid ${isActive ? t.accent : t.border}`,
                borderRadius: '14px',
                padding: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                position: 'relative',
                boxShadow: isActive ? `0 0 0 2px ${t.accent}33` : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = `${t.accent}88`;
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = t.border;
              }}
            >
              {/* Active checkmark */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: t.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              )}

              {/* Color swatches */}
              <div
                style={{
                  display: 'flex',
                  gap: 3,
                  marginBottom: 8,
                  borderRadius: 6,
                  overflow: 'hidden',
                  height: 18,
                }}
              >
                <div style={{ flex: 1, background: t.bg }} />
                <div style={{ flex: 1, background: t.surface }} />
                <div style={{ flex: 1.5, background: t.accent }} />
                <div style={{ flex: 1, background: t.border }} />
              </div>

              {/* Label */}
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.3 }}>
                {t.emoji} {t.label}
              </div>
              {t.description && (
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2, opacity: 0.8 }}>
                  {t.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
