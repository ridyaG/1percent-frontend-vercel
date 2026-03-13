import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar, getStreakLabel, getStreakBadgeClass } from '../lib/utils';
import ThemeFloating from '../components/settings/ThemeFloating';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');
  const streak = user?.currentStreak || 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cover */}
      <div className="h-32 relative" style={{ background: 'linear-gradient(to right, var(--color-accent-bg), var(--color-border))' }}>
        <div className="absolute -bottom-12 left-6">
          <img src={avatar} className="w-24 h-24 rounded-full"
            style={{ border: '4px solid var(--color-bg)' }} alt="" />
        </div>
      </div>

      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {user?.displayName || user?.username}
            </h1>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>@{user?.username}</span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStreakBadgeClass(streak)}`}>
            {getStreakLabel(streak)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 rounded-xl p-4 mb-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {[
            { n: '0', l: 'Posts' },
            { n: '0', l: 'Followers' },
            { n: '0', l: 'Following' },
            { n: String(streak), l: 'Streak 🔥' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{s.n}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-4xl mb-3">🚀</div>
          <div>No posts yet. Share your first win!</div>
        </div>

        <ThemeFloating />
      </div>
    </div>
  );
}
