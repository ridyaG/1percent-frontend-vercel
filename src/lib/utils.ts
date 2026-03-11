import { formatDistanceToNow } from 'date-fns';

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDefaultAvatar(username: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;
}

export function getStreakBadgeClass(streak: number) {
  if (streak >= 365) return 'text-yellow-300 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-yellow-400/30';
  if (streak >= 100) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  if (streak >= 30) return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (streak >= 7) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
}

export function getStreakLabel(streak: number) {
  if (streak >= 365) return `🏆 LEGEND — ${streak} Days`;
  if (streak >= 100) return `⚡ ${streak} Day Streak`;
  if (streak >= 30) return `🔥 ${streak} Day Streak`;
  if (streak >= 7) return `🔥 ${streak} Day Streak`;
  return `Day ${streak}`;
}

export function linkHashtags(text: string) {
  return text.replace(
    /#(\w+)/g,
    '<span class="text-[#FF5C00] cursor-pointer hover:underline">#$1</span>'
  );
}