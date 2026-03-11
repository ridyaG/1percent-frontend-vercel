import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';

export default function StreaksPage() {
  const user = useAuthStore((s) => s.user);
  const streak = user?.currentStreak || 0;
  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
          <div className="text-6xl font-bold text-[#FF5C00]" style={{ textShadow: '0 0 40px rgba(255,92,0,0.3)' }}>
            37x
          </div>
          <div className="text-gray-400 text-sm mt-2">Better in a year at 1% daily growth</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
          <img src={avatar} className="w-16 h-16 rounded-full border-2 border-[#FF5C00] mx-auto mb-3" alt="" />
          <div className="text-xs font-bold text-gray-400 tracking-wider mb-1">YOUR STREAK</div>
          <div className="text-5xl font-bold text-[#FF5C00]" style={{ textShadow: '0 0 40px rgba(255,92,0,0.3)' }}>
            {streak}
          </div>
          <div className="text-gray-500 text-sm mt-1">Days consecutive 🔥</div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Community Streaks</h2>
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">🔥</div>
        <div>Streak leaderboard coming soon</div>
      </div>
    </div>
  );
}