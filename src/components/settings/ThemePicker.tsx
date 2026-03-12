import { useThemeStore, themes, type ThemeName } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

export default function ThemePicker() {
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore(s => s.user);

  return (
    <div className="p-4">
      <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        Choose Theme
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(themes) as [ThemeName, typeof themes[ThemeName]][]).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTheme(key, user?.id)}
            style={{
              background: t.surface,
              border: `2px solid ${theme === key ? t.accent : t.border}`,
              borderRadius: '14px',
              padding: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
          >
            {/* Palette swatches */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, borderRadius: 6, overflow: 'hidden', height: 20 }}>
              {[t.bg, t.surface, t.accent, t.accentText === '#fff' ? t.border : t.text].map((c, i) => (
                <div key={i} style={{ flex: 1, background: c }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>
              {t.emoji} {t.label}
            </div>
            {theme === key && (
              <div style={{ fontSize: 10, color: t.accent, marginTop: 2 }}>✓ Active</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
