interface Props {
  streak: number;
  size?: 'sm' | 'md';
}

export default function StreakBadge({ streak, size = 'sm' }: Props) {
  if (streak <= 0) return null;

  let style: React.CSSProperties;
  let label: string;

  if (streak >= 365) {
    style = {
      background: 'linear-gradient(135deg, rgba(255,183,0,0.2), rgba(168,85,247,0.2))',
      border: '1px solid rgba(255,183,0,0.35)',
      color: '#fbbf24',
    };
    label = `🏆 ${streak}d`;
  } else if (streak >= 100) {
    style = {
      background: 'rgba(251,191,36,0.12)',
      border: '1px solid rgba(251,191,36,0.25)',
      color: '#fbbf24',
    };
    label = `⚡ ${streak}d`;
  } else if (streak >= 30) {
    style = {
      background: 'rgba(248,113,113,0.12)',
      border: '1px solid rgba(248,113,113,0.25)',
      color: '#f87171',
    };
    label = `🔥 ${streak}d`;
  } else if (streak >= 7) {
    style = {
      background: 'rgba(251,146,60,0.12)',
      border: '1px solid rgba(251,146,60,0.25)',
      color: '#fb923c',
    };
    label = `🔥 ${streak}d`;
  } else {
    style = {
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-muted)',
    };
    label = `Day ${streak}`;
  }

  return (
    <span
      className="inline-flex items-center shrink-0"
      style={{
        ...style,
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
