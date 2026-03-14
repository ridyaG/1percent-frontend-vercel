import { useState, type CSSProperties, type ReactNode } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Pencil, Trash2, X } from 'lucide-react';
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
        className="mb-5 overflow-hidden rounded-[28px] transition-all"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 92%, white 8%) 0%, color-mix(in srgb, var(--color-bg-elevated) 82%, white 18%) 100%)',
          border: '1px solid color-mix(in srgb, var(--color-border) 82%, white 18%)',
          boxShadow: '0 20px 40px rgba(2, 6, 23, 0.16)',
        } as CSSProperties}
      >
        <div
          className="px-5 pt-5 pb-4"
          style={{
            background:
              `radial-gradient(circle at top right, ${typeMeta.accent}18, transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent)`,
          }}
        >
          <div className="mb-4 h-[3px] w-16 rounded-full" style={{ background: typeMeta.accent, opacity: 0.9 }} />
          <div className="flex items-start gap-3">
          <Link to={`/profile/${author.username}`} className="shrink-0">
            <img
              src={author.avatarUrl || getDefaultAvatar(author.username)}
              className="h-11 w-11 rounded-full object-cover"
              style={{
                border: '2px solid color-mix(in srgb, var(--color-border) 75%, white 25%)',
                boxShadow: '0 10px 20px rgba(2, 6, 23, 0.12)',
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
                style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}
              >
                {author.displayName}
              </Link>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                @{author.username}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-border)' }}>·</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {time}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: `${typeMeta.accent}18`,
                  color: typeMeta.accent,
                  border: `1px solid ${typeMeta.accent}30`,
                  boxShadow: `inset 0 1px 0 ${typeMeta.accent}12`,
                }}
              >
                {typeMeta.icon} {typeMeta.label}
              </span>

              {post.hashtags?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <StreakBadge streak={author.currentStreak || 0} />
          </div>
        </div>
        </div>

        <div className="px-5 pb-4">
          <div
            className="rounded-[22px] px-4 py-4"
            style={{
              background: 'color-mix(in srgb, var(--color-surface) 72%, white 28%)',
              border: '1px solid color-mix(in srgb, var(--color-border) 84%, white 16%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <p
              className="text-[15px] leading-8"
              style={{ color: 'var(--color-text)' }}
              dangerouslySetInnerHTML={{ __html: linkHashtags(post.content) }}
            />
          </div>

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div
              className="mt-3 overflow-hidden rounded-[22px]"
              style={{
                display: 'grid',
                gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : '1fr 1fr',
                gap: '3px',
                border: '1px solid color-mix(in srgb, var(--color-border) 84%, white 16%)',
              }}
            >
              {post.mediaUrls.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="h-52 w-full object-cover"
                  alt=""
                />
              ))}
            </div>
          )}
        </div>

        {isOwnPost && (
          <div className="flex justify-end gap-1.5 px-5 pb-3">
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                color: 'var(--color-text-muted)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              onClick={() => window.confirm('Delete this post?') && deletePost()}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
              style={{
                color: 'var(--color-text-muted)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#ef4444';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
              }}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}

        <div
          className="flex items-center justify-between px-3 py-2"
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--color-border) 85%, white 15%)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
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
