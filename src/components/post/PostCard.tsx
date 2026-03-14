import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Pencil, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLike } from '../../hooks/useLike';
import StreakBadge from '../profile/StreakBadge';
import CommentSection from './CommentSection';
import { postsApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';
import type { Post } from '../../types/post';
import { getDefaultAvatar } from '../../lib/utils';
import toast from 'react-hot-toast';

const POST_TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
  daily_win:      { label: 'Daily Win',      icon: '🏆', color: 'rgba(255,162,0,0.12)'  },
  milestone:      { label: 'Milestone',      icon: '🎯', color: 'rgba(99,102,241,0.12)' },
  reflection:     { label: 'Reflection',     icon: '💭', color: 'rgba(14,165,233,0.12)' },
  challenge:      { label: 'Challenge',      icon: '⚡', color: 'rgba(255,92,0,0.12)'   },
  goal_update:    { label: 'Goal Update',    icon: '📈', color: 'rgba(16,185,129,0.12)' },
  photo_progress: { label: 'Photo Progress', icon: '📸', color: 'rgba(244,63,94,0.12)'  },
};

function PostTypeBadge({ type }: { type: string }) {
  const t = POST_TYPE_MAP[type] ?? POST_TYPE_MAP.daily_win;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: t.color,
        color: 'var(--color-text)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {t.icon} {t.label}
    </span>
  );
}

function linkHashtags(text: string) {
  return text.replace(
    /#(\w+)/g,
    `<span style="color:var(--color-accent);cursor:pointer;font-weight:500" class="hashtag-link">#$1</span>`
  );
}

function EditPostModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [content, setContent] = useState(post.content);
  const [postType, setPostType] = useState(post.postType);

  const { mutate: updatePost, isPending } = useMutation({
    mutationFn: () => postsApi.update(post.id, { content: content.trim(), postType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['user-posts'] });
      qc.invalidateQueries({ queryKey: ['explore-recent'] });
      qc.invalidateQueries({ queryKey: ['search'] });
      toast.success('Post updated');
      onClose();
    },
    onError: () => toast.error('Could not update post'),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Edit post</div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {Object.entries(POST_TYPE_MAP).map(([value, type]) => (
              <button
                key={value}
                onClick={() => setPostType(value)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: postType === value ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: postType === value ? '#fff' : 'var(--color-text-muted)',
                  border: `1px solid ${postType === value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-3xl px-4 py-4 text-sm outline-none"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <div className="flex justify-end gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose} className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Cancel
          </button>
          <button
            onClick={() => content.trim() && updatePost()}
            disabled={!content.trim() || isPending}
            className="rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const { mutate: toggleLike } = useLike();
  const authUser = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const author   = post.author;
  const likes    = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;
  const time     = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  const isOwnPost = authUser?.id === post.author.id;

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => postsApi.remove(post.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['user-posts'] });
      qc.invalidateQueries({ queryKey: ['explore-recent'] });
      qc.invalidateQueries({ queryKey: ['search'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Could not delete post'),
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Check this out on 1% Better', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch {toast.error('Failed to copy link.');}
  };

  return (
    <>
      <article
        className="card mb-4 p-5 animate-fade-in"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/profile/${author.username}`}>
            <img
              src={author.avatarUrl || getDefaultAvatar(author.username)}
              className="avatar avatar-md mt-0.5"
              alt={author.displayName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getDefaultAvatar(author.username);
              }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/profile/${author.username}`} className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span
                  className="font-semibold text-sm"
                  style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}
                >
                  {author.displayName}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  @{author.username}
                </span>
              </Link>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
              {time}
            </div>
          </div>
          <StreakBadge streak={author.currentStreak || 0} />
        </div>

        <div className="mb-3">
          <PostTypeBadge type={post.postType} />
        </div>

        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: 'var(--color-text)', lineHeight: '1.72' }}
          dangerouslySetInnerHTML={{ __html: linkHashtags(post.content) }}
        />

        <div className="divider mb-3" />

        {isOwnPost && (
          <div className="mb-3 flex justify-end gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm('Delete this post?')) {
                  deletePost();
                }
              }}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}

        <div className="flex items-center">
          <button
            onClick={() => toggleLike({ postId: post.id, liked: post.liked ?? false })}
            className={`post-action ${post.liked ? 'liked' : ''}`}
          >
            <Heart
              size={16}
              fill={post.liked ? 'currentColor' : 'none'}
              style={{ transition: 'transform 0.15s' }}
            />
            <span>{likes > 0 ? likes : ''}</span>
          </button>

          <button
            onClick={() => setShowComments(v => !v)}
            className={`post-action ${showComments ? 'active' : ''}`}
          >
            <MessageCircle size={16} />
            <span>{comments > 0 ? comments : ''}</span>
          </button>

          <button onClick={handleShare} className="post-action">
            <Share2 size={16} />
          </button>

          <button
            onClick={() => setBookmarked(b => !b)}
            className={`post-action ml-auto ${bookmarked ? 'active' : ''}`}
          >
            <Bookmark
              size={16}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </article>

      {showComments && (
        <CommentSection
          postId={post.id}
          post={post}
          onClose={() => setShowComments(false)}
        />
      )}
      {editOpen && <EditPostModal post={post} onClose={() => setEditOpen(false)} />}
    </>
  );
}
