import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar, getStreakBadgeClass, getStreakLabel } from '../lib/utils';
import { usersApi } from '../api/users';
import type { User } from '../types/user';

function CompoundCard() {
  return (
    <div
      className="rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: 'var(--color-accent-gradient)' }}
      />
      <div className="relative">
        <div className="text-6xl font-bold font-display" style={{ color: 'var(--color-accent)' }}>
          37×
        </div>
        <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Better in one year at 1% daily growth
        </div>
        <div className="text-xs mt-3 opacity-50 font-mono">(1.01)^365 = 37.78</div>
      </div>
    </div>
  );
}

function MyStreakCard({ streak, longestStreak, avatar, username }: {
  streak: number; longestStreak: number; avatar: string; username: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <img
        src={avatar}
        className="w-16 h-16 rounded-full mx-auto mb-3"
        style={{ border: '2px solid var(--color-accent)' }}
        alt={username}
      />
      <div className="text-xs font-bold tracking-[3px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
        YOUR STREAK
      </div>
      <div className="text-5xl font-bold font-display" style={{ color: 'var(--color-accent)' }}>
        {streak}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
        Days consecutive 🔥
      </div>
      {longestStreak > 0 && (
        <div className="text-xs mt-3" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
          Personal best: {longestStreak} days
        </div>
      )}
    </div>
  );
}

function LeaderRow({ user, rank }: { user: User; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{
        background: rank <= 3 ? 'var(--color-accent-bg)' : 'transparent',
        border: `1px solid ${rank <= 3 ? 'var(--color-accent-bg)' : 'transparent'}`,
      }}
    >
      <span
        className="w-7 text-center text-sm font-bold shrink-0"
        style={{ color: rank <= 3 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
      >
        {medals[rank - 1] ?? rank}
      </span>
      <img
        src={user.avatarUrl || getDefaultAvatar(user.username)}
        className="w-9 h-9 rounded-full shrink-0"
        alt={user.displayName}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
          {user.displayName}
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          @{user.username}
        </div>
      </div>
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStreakBadgeClass(user.currentStreak)}`}
      >
        {getStreakLabel(user.currentStreak)}
      </span>
    </div>
  );
}

export default function StreaksPage() {
  const user = useAuthStore(s => s.user);
  const streak = user?.currentStreak || 0;
  const longestStreak = 0; // Will come from full profile fetch
  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  const { data: leaders = [], isLoading } = useQuery<User[]>({
    queryKey: ['leaderboard'],
    queryFn: usersApi.getLeaderboard,
    staleTime: 1000 * 60 * 5,
  });

  // Sort by streak descending
  const sorted = [...leaders].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Top stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <CompoundCard />
        <MyStreakCard
          streak={streak}
          longestStreak={longestStreak}
          avatar={avatar}
          username={user?.username || 'you'}
        />
      </div>

      {/* Leaderboard */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>
            🔥 Community Streak Leaders
          </h2>
        </div>

        <div
          className="divide-y"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                  <div className="w-7 h-5 rounded" style={{ background: 'var(--color-border)' }} />
                  <div className="w-9 h-9 rounded-full" style={{ background: 'var(--color-border)' }} />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-28 rounded" style={{ background: 'var(--color-border)' }} />
                    <div className="h-2 w-16 rounded" style={{ background: 'var(--color-border)' }} />
                  </div>
                  <div className="h-6 w-20 rounded-full" style={{ background: 'var(--color-border)' }} />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl mb-3">🔥</div>
              <div>No streak data yet — start posting daily!</div>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {sorted.map((u, i) => (
                <LeaderRow key={u.id} user={u} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
