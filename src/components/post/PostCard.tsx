import { useState, type CSSProperties } from 'react';
import {
  Heart, MessageCircle, Bookmark,
  Eye, Pencil, Trash2, X, MoreHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLike } from '../../hooks/useLike';
import StreakBadge from '../profile/StreakBadge';
import CommentSection from './CommentSection';
import { postsApi } from '../../api/posts';
import { getApiErrorMessage } from '../../api/errors';
import { useAuthStore } from '../../store/authStore';
import type { Post } from '../../types/post';
import { getDefaultAvatar } from '../../lib/utils';
import toast from 'react-hot-toast';

const POST_TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
  daily_win:      { label: 'Daily Win',      icon: '🏆', color: '#f59e0b' },
  milestone:      { label: 'Milestone',      icon: '🎯', color: '#6366f1' },
  reflection:     { label: 'Reflection',     icon: '💭', color: '#64748b' },
  challenge:      { label: 'Challenge',      icon: '⚡', color: '#FF5C00' },
  goal_update:    { label: 'Goal Update',    icon: '📈', color: '#10b981' },
  photo_progress: { label: 'Photo Progress', icon: '📸', color: '#ec4899' },
};

function linkHashtags(text: string) {
  return text.replace(
    /#(\w+)/g,
    `<span style="color:var(--color-accent);font-weight:600;cursor:pointer">#$1</span>`
  );
}

function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['feed'] });
  queryClient.invalidateQueries({ queryKey: ['user-posts'] });
  queryClient.invalidateQueries({ queryKey: ['explore-recent'] });
  queryClient.invalidateQueries({ queryKey: ['search'] });
}

function EditPostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const qc = useQueryClient();
  const [content, setContent] = useState(post.content);
  const [postType, setPostType] = useState(post.postType);
  const MAX = 500;

  const { mutate: updatePost, isPending } = useMutation({
    mutationFn: () => postsApi.update(post.id, { content: content.trim(), postType }),
    onSuccess: () => {
      invalidatePostQueries(qc);
      toast.success('Post updated');
      onClose();
    },
    onError: err =>
      toast.error(getApiErrorMessage(err, { fallback: 'Could not update post.', action: 'update your post' })),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Edit Post</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: 'var(--color-hover)', color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {Object.entries(POST_TYPE_MAP).map(([val, t]) => (
            <button
              key={val}
              onClick={() => setPostType(val)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: postType === val ? 'var(--color-accent)' : 'transparent',
                color: postType === val ? '#fff' : 'var(--color-text-muted)',
                border: `1px solid ${postType === val ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={MAX}
            rows={5}
            autoFocus
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              caretColor: 'var(--color-accent)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <div className="mt-1.5 text-right text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {MAX - content.length}
          </div>
        </div>

        <div
          className="flex justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm"
            style={{ color: 'var(--color-text-muted)', background: 'var(--color-hover)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => content.trim() && updatePost()}
            disabled={!content.trim() || isPending}
            className="rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OwnerMenu({
  onEdit,
  onDelete,
  isDeleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl py-1 shadow-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                if (window.confirm('Delete this post?')) onDelete();
              }}
              disabled={isDeleting}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
              style={{ color: '#ef4444' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
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
  const [likePopping, setLikePopping] = useState(false);

  const author = post.author;
  const likes = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;
  const time = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  const isOwnPost = authUser?.id === post.author.id;
  const typeMeta = POST_TYPE_MAP[post.postType] ?? POST_TYPE_MAP.daily_win;
  const hasMedia = (post.mediaUrls?.length ?? 0) > 0;
  const viewCount = likes > 0 ? (likes * 27 + 12).toLocaleString() : '—';

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => postsApi.remove(post.id),
    onSuccess: () => {
      invalidatePostQueries(qc);
      toast.success('Post deleted');
    },
    onError: err =>
      toast.error(getApiErrorMessage(err, { fallback: 'Could not delete post.', action: 'delete your post' })),
  });

  const handleLike = () => {
    setLikePopping(true);
    setTimeout(() => setLikePopping(false), 320);
    toggleLike({ postId: post.id, liked: post.liked ?? false });
  };

  return (
    <>
      <article
        className="mb-4 overflow-hidden rounded-3xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
        } as CSSProperties}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <Link to={`/profile/${author.username}`} className="shrink-0">
            <img
              src={author.avatarUrl || getDefaultAvatar(author.username)}
              className="h-11 w-11 rounded-full object-cover"
              style={{ border: '2.5px solid var(--color-border)' } as CSSProperties}
              alt={author.displayName}
              onError={e => {
                (e.target as HTMLImageElement).src = getDefaultAvatar(author.username);
              }}
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Link
                to={`/profile/${author.username}`}
                className="text-[15px] font-bold leading-snug transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text)' }}
              >
                {author.displayName}
              </Link>
              {(author.currentStreak || 0) >= 7 && (
                <span
                  title={`${author.currentStreak}-day streak`}
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--color-accent)', color: '#fff', lineHeight: 1 }}
                >
                  🔥
                </span>
              )}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Posted {time}
            </span>
          </div>

          <StreakBadge streak={author.currentStreak || 0} />

          {isOwnPost ? (
            <OwnerMenu onEdit={() => setEditOpen(true)} onDelete={() => deletePost()} isDeleting={isDeleting} />
          ) : (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-wide"
            style={{
              background: `${typeMeta.color}1a`,
              color: typeMeta.color,
              border: `1px solid ${typeMeta.color}35`,
            }}
          >
            {typeMeta.icon} {typeMeta.label}
          </span>

          {post.hashtags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
              style={{
                background: 'var(--color-hover)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="px-5 pb-4">
          <p
            className="text-[15px] leading-[1.7]"
            style={{ color: 'var(--color-text)' }}
            dangerouslySetInnerHTML={{ __html: linkHashtags(post.content) }}
          />
        </div>

        {hasMedia && (
          <div className="relative mx-4 mb-4 overflow-hidden rounded-2xl bg-black">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: post.mediaUrls!.length === 1 ? '1fr' : '1fr 1fr',
                gap: '2px',
              }}
            >
              {post.mediaUrls!.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full object-cover"
                  style={{ height: post.mediaUrls!.length === 1 ? '380px' : '200px' }}
                />
              ))}
            </div>

            <div
              className="absolute inset-x-0 bottom-0 flex items-end justify-around px-5 py-4"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
              }}
            >
              {[
                { emoji: '⏱', value: '52', unit: 'Minutes' },
                { emoji: '🔥', value: '128', unit: 'kcal' },
                { emoji: '⭐', value: '3', unit: 'Score' },
              ].map(stat => (
                <div key={stat.unit} className="flex flex-col items-center gap-0.5">
                  <span className="text-base font-bold text-white">
                    {stat.emoji} {stat.value}
                  </span>
                  <span className="text-[11px] text-white/60">{stat.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-0.5">
            <div
              className="flex items-center gap-1.5 px-3 py-2 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Eye size={15} />
              <span>{viewCount}</span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all select-none"
              style={{
                color: post.liked ? '#ec4899' : 'var(--color-text-muted)',
                background: post.liked ? 'rgba(236,72,153,0.1)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!post.liked) (e.currentTarget.style.background = 'var(--color-hover)');
              }}
              onMouseLeave={e => {
                if (!post.liked) (e.currentTarget.style.background = 'transparent');
              }}
            >
              <Heart
                size={15}
                fill={post.liked ? 'currentColor' : 'none'}
                style={{
                  transform: likePopping ? 'scale(1.45)' : 'scale(1)',
                  transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1)',
                }}
              />
              <span>{likes > 0 ? likes : ''}</span>
            </button>

            <button
              onClick={() => setShowComments(v => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
              style={{
                color: showComments ? '#60a5fa' : 'var(--color-text-muted)',
                background: showComments ? 'rgba(96,165,250,0.1)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!showComments) (e.currentTarget.style.background = 'var(--color-hover)');
              }}
              onMouseLeave={e => {
                if (!showComments) (e.currentTarget.style.background = 'transparent');
              }}
            >
              <MessageCircle size={15} />
              <span>{comments > 0 ? comments : ''}</span>
            </button>
          </div>

          <button
            onClick={() => setBookmarked(b => !b)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
            style={{
              color: bookmarked ? '#f59e0b' : 'var(--color-text-muted)',
              background: bookmarked ? 'rgba(245,158,11,0.1)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (!bookmarked) (e.currentTarget.style.background = 'var(--color-hover)');
            }}
            onMouseLeave={e => {
              if (!bookmarked) (e.currentTarget.style.background = 'transparent');
            }}
          >
            <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </article>

      {showComments && (
        <CommentSection postId={post.id} post={post} onClose={() => setShowComments(false)} />
      )}
      {editOpen && <EditPostModal post={post} onClose={() => setEditOpen(false)} />}
    </>
  );
}
