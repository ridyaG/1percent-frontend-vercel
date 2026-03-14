import { useState, type CSSProperties, type ReactNode } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Pencil, Trash2, X, MoreVertical, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLike } from '../../hooks/useLike';
import CommentSection from './CommentSection';
import { postsApi } from '../../api/posts';
import { getApiErrorMessage } from '../../api/errors';
import { useAuthStore } from '../../store/authStore';
import type { Post } from '../../types/post';
import { getDefaultAvatar } from '../../lib/utils';
import toast from 'react-hot-toast';

const POST_TYPE_MAP: Record<string, { label: string; icon: string; accent: string }> = {
  daily_win:      { label: 'Daily Win',      icon: '🏆', accent: '#f59e0b' },
  milestone:      { label: 'Milestone',      icon: '🎯', accent: '#6366f1' },
  reflection:     { label: 'Reflection',     icon: '💭', accent: '#64748b' },
  challenge:      { label: 'Challenge',      icon: '⚡', accent: 'var(--color-accent)' },
  goal_update:    { label: 'Goal Update',    icon: '📈', accent: '#10b981' },
  photo_progress: { label: 'Photo Progress', icon: '📸', accent: '#ec4899' },
};

function linkHashtags(text: string) {
  return text.replace(
    /#(\w+)/g,
    `<span style="color:var(--color-accent);font-weight:600;cursor:pointer" class="hashtag-link">#$1</span>`
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
    onError: (error) =>
      toast.error(getApiErrorMessage(error, { fallback: 'Could not update post.', action: 'update your post' })),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            Edit post
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--color-hover)', color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {Object.entries(POST_TYPE_MAP).map(([value, t]) => (
            <button
              key={value}
              onClick={() => setPostType(value)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: postType === value ? 'var(--color-accent)' : 'transparent',
                color: postType === value ? '#fff' : 'var(--color-text-muted)',
                border: `1px solid ${postType === value ? 'var(--color-accent)' : 'var(--color-border)'}`,
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
            className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
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
            className="rounded-xl px-4 py-2 text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'var(--color-hover)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => content.trim() && updatePost()}
            disabled={!content.trim() || isPending}
            className="rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  active,
  activeColor,
  children,
  title,
}: {
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all select-none"
      style={{
        color: active ? activeColor ?? 'var(--color-accent)' : 'var(--color-text-muted)',
        background: active ? `${activeColor ?? 'var(--color-accent)'}18` : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-hover)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="flex min-w-[86px] items-center gap-2 rounded-2xl px-3 py-2"
      style={{
        background: 'rgba(15, 23, 42, 0.38)',
        color: '#fff',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <div className="shrink-0 opacity-90">{icon}</div>
      <div className="leading-none">
        <div className="text-base font-bold">{value}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/70">{label}</div>
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
  const [likePopping, setLikePopping] = useState(false);

  const author = post.author;
  const likes = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;
  const time = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  const isOwnPost = authUser?.id === post.author.id;
  const typeMeta = POST_TYPE_MAP[post.postType] ?? POST_TYPE_MAP.daily_win;
  const pseudoViews = Math.max(24, likes * 17 + comments * 9 + 48);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => postsApi.remove(post.id),
    onSuccess: () => {
      invalidatePostQueries(qc);
      toast.success('Post deleted');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, { fallback: 'Could not delete post.', action: 'delete your post' })),
  });

  const handleLike = () => {
    setLikePopping(true);
    setTimeout(() => setLikePopping(false), 350);
    toggleLike({ postId: post.id, liked: post.liked ?? false });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Check this out on 1% Better', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  return (
    <>
      <article
        className="mb-5 overflow-hidden rounded-[34px] transition-all"
        style={{
          background: 'color-mix(in srgb, white 90%, var(--color-surface) 10%)',
          border: '1px solid rgba(255,255,255,0.58)',
          boxShadow: '0 26px 60px rgba(15, 23, 42, 0.16)',
        } as CSSProperties}
      >
        <div
          className="px-5 pt-5 pb-4 sm:px-6"
          style={{
            background:
              `radial-gradient(circle at top right, ${typeMeta.accent}10, transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.72))`,
          }}
        >
          <div className="flex items-start gap-3">
          <Link to={`/profile/${author.username}`} className="shrink-0">
            <img
              src={author.avatarUrl || getDefaultAvatar(author.username)}
              className="h-12 w-12 rounded-full object-cover"
              style={{
                border: '3px solid rgba(255,255,255,0.9)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
              }}
              alt={author.displayName}
              onError={e => {
                (e.target as HTMLImageElement).src = getDefaultAvatar(author.username);
              }}
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${author.username}`}
                className="text-[15px] font-semibold transition-opacity hover:opacity-75"
                style={{ color: '#111827', fontFamily: "'Syne', sans-serif" }}
              >
                {author.displayName}
              </Link>
              {(author.currentStreak || 0) >= 7 && (
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                  style={{ background: '#2563eb', color: '#fff' }}
                  title="Verified momentum"
                >
                  ✓
                </span>
              )}
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                @{author.username}
              </span>
            </div>
            <span className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>
              Posted {time}
            </span>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: `${typeMeta.accent}14`,
                  color: typeMeta.accent,
                  border: `1px solid ${typeMeta.accent}30`,
                }}
              >
                {typeMeta.icon} {typeMeta.label}
              </span>

              {post.hashtags?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    background: `${typeMeta.accent}10`,
                    color: typeMeta.accent,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            {isOwnPost ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                  style={{
                    background: 'rgba(15,23,42,0.04)',
                    color: '#6b7280',
                    border: '1px solid rgba(15,23,42,0.08)',
                  }}
                  title="Edit post"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => window.confirm('Delete this post?') && deletePost()}
                  disabled={isDeleting}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(15,23,42,0.04)',
                    color: '#6b7280',
                    border: '1px solid rgba(15,23,42,0.08)',
                  }}
                  title="Delete post"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(15,23,42,0.04)',
                  color: '#9ca3af',
                  border: '1px solid rgba(15,23,42,0.08)',
                }}
                title="More"
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>
        </div>
        </div>

        <div className="px-5 pb-4 sm:px-6">
          <p
            className="text-[17px] leading-[1.8]"
            style={{ color: '#1f2937' }}
            dangerouslySetInnerHTML={{ __html: linkHashtags(post.content) }}
          />

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div
              className="relative mt-4 overflow-hidden rounded-[28px]"
              style={{
                display: 'grid',
                gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : '1fr 1fr',
                gap: '3px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              }}
            >
              {post.mediaUrls.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="h-72 w-full object-cover sm:h-80"
                  alt=""
                />
              ))}

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 p-4"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(15,23,42,0.78))',
                }}
              >
                <div className="flex flex-wrap gap-2">
                  <StatPill icon={<Eye size={15} />} value={pseudoViews.toLocaleString()} label="Views" />
                  <StatPill icon={<Heart size={15} fill="currentColor" />} value={likes} label="Likes" />
                  <StatPill icon={<MessageCircle size={15} />} value={comments} label="Replies" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5 sm:px-5"
          style={{
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            background: 'rgba(255,255,255,0.72)',
          }}
        >
          <div className="flex items-center">
            <ActionBtn
              onClick={handleLike}
              active={post.liked}
              activeColor="#ec4899"
              title="Like"
            >
              <Heart
                size={15}
                fill={post.liked ? 'currentColor' : 'none'}
                style={{
                  transform: likePopping ? 'scale(1.35)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1)',
                }}
              />
              {likes > 0 && <span>{likes}</span>}
            </ActionBtn>

            <ActionBtn
              onClick={() => setShowComments(v => !v)}
              active={showComments}
              activeColor="#60a5fa"
              title="Comments"
            >
              <MessageCircle size={15} />
              {comments > 0 && <span>{comments}</span>}
            </ActionBtn>

            <ActionBtn onClick={handleShare} title="Share">
              <Share2 size={15} />
            </ActionBtn>
          </div>

          <ActionBtn
            onClick={() => setBookmarked(b => !b)}
            active={bookmarked}
            activeColor="#f59e0b"
            title={bookmarked ? 'Unsave' : 'Save'}
          >
            <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
          </ActionBtn>
        </div>
      </article>

      {showComments && (
        <CommentSection postId={post.id} post={post} onClose={() => setShowComments(false)} />
      )}
      {editOpen && <EditPostModal post={post} onClose={() => setEditOpen(false)} />}
    </>
  );
}
