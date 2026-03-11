export default function StreakBadge({ streak }: { streak: number }) {
  let color = 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  let label = `Day ${streak}`;

  if (streak >= 365) {
    color = 'text-yellow-300 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-yellow-400/30';
    label = `🏆 LEGEND — ${streak} Days`;
  } else if (streak >= 100) {
    color = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    label = `⚡ ${streak} Day Streak`;
  } else if (streak >= 30) {
    color = 'text-red-400 bg-red-500/10 border-red-500/20';
    label = `🔥 ${streak} Day Streak`;
  } else if (streak >= 7) {
    color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    label = `🔥 ${streak} Day Streak`;
  }

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}
 
