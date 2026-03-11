import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/users';

interface Leader {
  id: string;
  avatarUrl?: string;
  displayName: string;
  currentStreak: number;
}

export default function Leaderboard() {
  const { data: leaders = [] } = useQuery<Leader[]>({
    queryKey: ['leaderboard'],
    queryFn: () => usersApi.getLeaderboard(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-3">🔥 Streak Leaders</h3>

      {leaders.map((user, i) => (
        <div key={user.id} className="flex items-center gap-3 py-2">
          <span
            className={`w-6 text-center text-sm font-bold ${
              i === 0 ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            {i + 1}
          </span>

          <img
            src={user.avatarUrl || '/default-avatar.png'}
            className="w-8 h-8 rounded-full"
          />

          <span className="flex-1 text-sm">{user.displayName}</span>

          <span className="text-[#FF5C00] font-bold text-sm">
            🔥 {user.currentStreak}
          </span>
        </div>
      ))}
    </div>
  );
}