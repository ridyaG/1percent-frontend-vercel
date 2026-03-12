import { useState } from 'react';
import CommentSection from './CommentSection';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLike } from '../../hooks/useLike';
import StreakBadge from '../profile/StreakBadge';
import type { Post } from '../../types/post';
import { getDefaultAvatar } from '../../lib/utils';

const POST_TYPES: Record<string, { label: string; icon: string }> = {
  daily_win:  { label: 'Daily Win', icon: '🏆' },
  milestone:  { label: 'Milestone', icon: '🎯' },
  reflection: { label: 'Reflection', icon: '💭' },
  challenge:  { label: 'Challenge', icon: '⚡' },
};

export default function PostCard({ post }: { post: Post }) {
  const { mutate: toggleLike } = useLike();
  const [showComments, setShowComments] = useState(false);
  const author = post.author;
  const type = POST_TYPES[post.postType] || POST_TYPES.daily_win;
  const likes = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;
  const time = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });

  const content = post.content.replace(
    /#(\w+)/g,
    `<span style="color:var(--color-accent);cursor:pointer" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">#$1</span>`
  );

  return (
    <>
      <div
        className="rounded-2xl p-5 mb-3 transition-colors"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={author.avatarUrl || getDefaultAvatar(author.username)}
            className="w-10 h-10 rounded-full"
            alt={author.displayName}
            onError={(e) => { (e.target as HTMLImageElement).src = getDefaultAvatar(author.username); }}
          />
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              {author.displayName}
              <span className="font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                @{author.username}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{time}</div>
          </div>
          <StreakBadge streak={author.currentStreak || 0} />
        </div>

        {/* Post type tag */}
        <span
          className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
          style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
        >
          {type.icon} {type.label}
        </span>

        {/* Content */}
        <p
          className="text-[15px] leading-relaxed mb-4"
          style={{ color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Actions */}
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <button
            onClick={() => toggleLike({ postId: post.id, liked: post.liked ?? false })}
            className="flex items-center gap-1.5 transition-colors hover:text-pink-500"
            style={{ color: post.liked ? '#ec4899' : undefined }}
          >
            <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
            {likes}
          </button>
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 transition-colors hover:text-blue-400"
            style={{ color: showComments ? '#60a5fa' : undefined }}
          >
            <MessageCircle size={18} /> {comments}
          </button>
          <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
            <Share2 size={18} /> Share
          </button>
          <button className="ml-auto hover:text-yellow-400 transition-colors">
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection postId={post.id} post={post} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}
