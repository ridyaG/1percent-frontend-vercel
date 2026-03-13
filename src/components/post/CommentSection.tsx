import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments, useAddComment } from '../../hooks/useComments';
import { getDefaultAvatar } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Post } from '../../types/post';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl?: string };
  replies?: Comment[];
}

interface Props {
  postId: string;
  post: Post;
  onClose: () => void;
}

function CommentRow({ c }: { c: Comment }) {
  return (
    <div className="flex gap-3">
      <img
        src={c.author.avatarUrl || getDefaultAvatar(c.author.username)}
        className="avatar avatar-md shrink-0 mt-0.5"
        alt=""
      />
      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {c.author.displayName}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            @{c.author.username}
          </span>
          <span className="text-xs ml-auto" style={{ color: 'var(--color-text-subtle)' }}>
            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Comment bubble */}
        <div
          className="rounded-xl px-3 py-2 text-sm leading-relaxed"
          style={{
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
          }}
        >
          {c.content}
        </div>

        {/* Replies */}
        {c.replies && c.replies.length > 0 && (
          <div
            className="mt-3 pl-4 space-y-3"
            style={{ borderLeft: '2px solid var(--color-accent-bg)' }}
          >
            {c.replies.map(r => (
              <div key={r.id} className="flex gap-2">
                <img
                  src={r.author.avatarUrl || getDefaultAvatar(r.author.username)}
                  className="w-7 h-7 rounded-full shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                      {r.author.displayName}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div
                    className="rounded-lg px-3 py-2 text-xs leading-relaxed"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
                  >
                    {r.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, post, onClose }: Props) {
  const [text, setText]       = useState('');
  const inputRef              = useRef<HTMLInputElement>(null);
  const user                  = useAuthStore(s => s.user);

  const { data: comments = [], isLoading } = useComments(postId, true);
  const { mutate: addComment, isPending }  = useAddComment(postId);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (!text.trim() || isPending) return;
    addComment(text.trim(), { onSuccess: () => setText('') });
  };

  const commentCount = (comments as Comment[]).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md flex flex-col animate-scale-in"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            maxHeight: '82vh',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={16} style={{ color: 'var(--color-accent)' }} />
              <div>
                <h3
                  className="font-bold text-base"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
                >
                  Comments
                </h3>
                {commentCount > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {commentCount} comment{commentCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Post preview ── */}
          <div
            className="mx-5 my-3 p-3.5 rounded-xl shrink-0"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src={post.author.avatarUrl || getDefaultAvatar(post.author.username)}
                className="w-7 h-7 rounded-full"
                alt=""
              />
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {post.author.displayName}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  @{post.author.username}
                </div>
              </div>
            </div>
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {post.content}
            </p>
          </div>

          <div className="shrink-0 mx-5" style={{ height: 1, background: 'var(--color-border)' }} />

          {/* ── Comments list ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="skeleton h-2.5 w-28" />
                      <div className="skeleton h-10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : commentCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle size={32} style={{ color: 'var(--color-text-subtle)', marginBottom: 12 }} />
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  No comments yet
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  Start the conversation!
                </div>
              </div>
            ) : (
              (comments as Comment[]).map(c => <CommentRow key={c.id} c={c} />)
            )}
          </div>

          {/* ── Input ── */}
          <div
            className="px-5 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2.5">
              {user && (
                <img
                  src={user.avatarUrl || getDefaultAvatar(user.username)}
                  className="w-8 h-8 rounded-full shrink-0"
                  alt=""
                />
              )}
              <div
                className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
                onFocusCapture={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--color-accent-bg)';
                }}
                onBlurCapture={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }}
                  maxLength={500}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() || isPending}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0 disabled:opacity-30"
                  style={{
                    background: text.trim() ? 'var(--color-accent)' : 'transparent',
                    color: text.trim() ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
