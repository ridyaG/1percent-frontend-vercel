import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar, getStreakBadgeClass, getStreakLabel } from '../lib/utils';
import { usersApi } from '../api/users';
import type { User } from '../types/user';
import { TrendingUp } from 'lucide-react';

function CompoundCard() {
  return (
    <div
      className="card rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: 'var(--color-accent-gradient)' }}
      />
      <div className="relative">
        <TrendingUp size={20} className="mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
        <div
          className="text-5xl font-bold"
          style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-accent)' }}
        >
          37×
        </div>
        <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Better in one year at 1% daily
        </div>
        <div
          className="text-xs mt-3 font-mono px-3 py-1.5 rounded-lg inline-block"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-subtle)' }}
        >
          (1.01)^365 = 37.78
        </div>
      </div>
    </div>
  );
}

function MyStreakCard({ streak, longestStreak, avatar, username }: {
  streak: number; longestStreak: number; avatar: string; username: string;
}) {
  return (
    <div
      className="card rounded-2xl p-6 text-center"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <img
        src={avatar}
        className="w-14 h-14 rounded-full mx-auto mb-3 object-cover"
        style={{ border: '2px solid var(--color-accent)', boxShadow: '0 0 16px var(--color-accent-glow)' }}
        alt={username}
      />
      <div
        className="text-xs font-bold tracking-[3px] mb-1 uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Your Streak
      </div>
      <div
        className="text-5xl font-bold"
        style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-accent)' }}
      >
        {streak}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {streak === 1 ? 'day' : 'days'} consecutive 🔥
      </div>
      {longestStreak > 0 && (
        <div className="text-xs mt-3" style={{ color: 'var(--color-text-subtle)' }}>
          Personal best: <strong style={{ color: 'var(--color-text-muted)' }}>{longestStreak} days</strong>
        </div>
      )}
    </div>
  );
}

function LeaderRow({ user, rank }: { user: User; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const isTop3 = rank <= 3;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{
        background: isTop3 ? 'var(--color-accent-bg)' : 'transparent',
        border: `1px solid ${isTop3 ? 'rgba(255,92,0,0.15)' : 'transparent'}`,
        marginBottom: 2,
      }}
      onMouseEnter={e => {
        if (!isTop3) (e.currentTarget as HTMLElement).style.background = 'var(--color-hover)';
      }}
      onMouseLeave={e => {
        if (!isTop3) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <span
        className="w-7 text-center text-sm font-bold shrink-0"
        style={{ color: isTop3 ? 'var(--color-accent)' : 'var(--color-text-subtle)' }}
      >
        {medals[rank - 1] ?? rank}
      </span>
      <img
        src={user.avatarUrl || getDefaultAvatar(user.username)}
        className="avatar avatar-md"
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
      <span className={`badge ${getStreakBadgeClass(user.currentStreak)}`}>
        {getStreakLabel(user.currentStreak)}
      </span>
    </div>
  );
}

export default function StreaksPage() {
  const user         = useAuthStore(s => s.user);
  const streak       = user?.currentStreak || 0;
  const longestStreak = 0;
  const avatar       = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  const { data: leaders = [], isLoading } = useQuery<User[]>({
    queryKey: ['leaderboard'],
    queryFn: usersApi.getLeaderboard,
    staleTime: 1000 * 60 * 5,
  });

  const sorted = [...leaders].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));

  return (
    <div className="page-container">
      {/* ── Top stats ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <CompoundCard />
        <MyStreakCard
          streak={streak}
          longestStreak={longestStreak}
          avatar={avatar}
          username={user?.username || 'you'}
        />
      </div>

      {/* ── Leaderboard ── */}
      <div
        className="card overflow-hidden"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            className="font-bold text-sm uppercase tracking-wider"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            🔥 Community Streak Leaders
          </h2>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="skeleton w-7 h-5 rounded" />
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-28" />
                    <div className="skeleton h-2 w-16" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔥</div>
              <div className="empty-state-title">No streak data yet</div>
              <div className="empty-state-desc">Start posting daily to appear on the leaderboard!</div>
            </div>
          ) : (
            sorted.map((u, i) => (
              <LeaderRow key={u.id} user={u} rank={i + 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
