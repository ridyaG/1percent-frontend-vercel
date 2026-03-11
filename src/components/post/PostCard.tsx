import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLike } from '../../hooks/useLike';
import StreakBadge from '../profile/StreakBadge';
import type { Post } from '../../types/post';

const POST_TYPES: Record<string, { label: string; icon: string }> = {
  daily_win:  { label: 'Daily Win', icon: '🏆' },
  milestone:  { label: 'Milestone', icon: '🎯' },
  reflection: { label: 'Reflection', icon: '💭' },
  challenge:  { label: 'Challenge', icon: '⚡' },
};

export default function PostCard({ post }: { post: Post }) {
  const { mutate: toggleLike } = useLike();
  const author = post.author;
  const type = POST_TYPES[post.postType] || POST_TYPES.daily_win;
  const likes = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;
  const time = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });

  const handleLike = () => {
    toggleLike({ postId: post.id, liked: post.liked ?? false });
  };

  // Linkify hashtags
  const content = post.content.replace(
    /#(\w+)/g,
    '<span class="text-[#FF5C00] cursor-pointer hover:underline">#$1</span>'
  );

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-3
                    hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img src={author.avatarUrl} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {author.displayName}
            <span className="text-gray-500 font-normal ml-1">@{author.username}</span>
          </div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <StreakBadge streak={author.currentStreak || 0} />
      </div>

      {/* Post type tag */}
      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full
                       bg-[#FF5C00]/10 text-[#FF5C00] mb-3">
        {type.icon} {type.label}
      </span>

      {/* Content */}
      <p className="text-[15px] leading-relaxed mb-4"
         dangerouslySetInnerHTML={{ __html: content }} />

      {/* Actions */}
      <div className="flex items-center gap-6 text-gray-400 text-sm">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 hover:text-pink-500
                      ${post.liked ? 'text-pink-500' : ''}`}>
          <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
          {likes}
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-400">
          <MessageCircle size={18} /> {comments}
        </button>
        <button className="flex items-center gap-1.5 hover:text-green-400">
          <Share2 size={18} /> Share
        </button>
        <button className="ml-auto hover:text-yellow-400">
          <Bookmark size={18} />
        </button>
      </div>
    </div>
  );
}
