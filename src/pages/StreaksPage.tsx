import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';

export default function StreaksPage() {
  const user = useAuthStore((s) => s.user);
  const streak = user?.currentStreak || 0;
  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-6xl font-bold" style={{ color: 'var(--color-accent)' }}>37x</div>
          <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Better in a year at 1% daily growth
          </div>
        </div>
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <img src={avatar}
            className="w-16 h-16 rounded-full mx-auto mb-3"
            style={{ border: '2px solid var(--color-accent)' }} alt="" />
          <div className="text-xs font-bold tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
            YOUR STREAK
          </div>
          <div className="text-5xl font-bold" style={{ color: 'var(--color-accent)' }}>{streak}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Days consecutive 🔥</div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Community Streaks</h2>
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        <div className="text-4xl mb-3">🔥</div>
        <div>Streak leaderboard coming soon</div>
      </div>
    </div>
  );
}
