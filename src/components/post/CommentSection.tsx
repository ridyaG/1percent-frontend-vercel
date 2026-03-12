import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments, useAddComment } from '../../hooks/useComments';
import { getDefaultAvatar } from '../../lib/utils';
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

export default function CommentSection({ postId, post, onClose }: Props) {
  const [text, setText] = useState('');
  const { data: comments = [], isLoading } = useComments(postId, true);
  const { mutate: addComment, isPending } = useAddComment(postId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(text.trim(), { onSuccess: () => setText('') });
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-md z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Comments</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {(comments as Comment[]).length} comment{(comments as Comment[]).length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Post preview */}
          <div
            className="mx-6 mb-4 p-4 rounded-2xl shrink-0"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <img src={post.author.avatarUrl || getDefaultAvatar(post.author.username)} className="w-8 h-8 rounded-full" alt="" />
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{post.author.displayName}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{post.author.username}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{post.content}</p>
          </div>

          <div className="h-px mx-6 shrink-0" style={{ background: 'var(--color-border)' }} />

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full shrink-0" style={{ background: 'var(--color-border)' }} />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-2.5 rounded w-28" style={{ background: 'var(--color-border)' }} />
                      <div className="h-8 rounded-xl" style={{ background: 'var(--color-border)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (comments as Comment[]).length === 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-4xl mb-3">💬</div>
                <div className="text-sm font-medium">No comments yet</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>Start the conversation!</div>
              </div>
            ) : (
              (comments as Comment[]).map(c => (
                <div key={c.id} className="flex gap-3">
                  <img src={c.author.avatarUrl || getDefaultAvatar(c.author.username)} className="w-9 h-9 rounded-full shrink-0 mt-0.5" alt="" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{c.author.displayName}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{c.author.username}</span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{c.content}</p>
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3 pl-3 space-y-3" style={{ borderLeft: '2px solid var(--color-accent-bg)' }}>
                        {c.replies.map(r => (
                          <div key={r.id} className="flex gap-2">
                            <img src={r.author.avatarUrl || getDefaultAvatar(r.author.username)} className="w-7 h-7 rounded-full shrink-0" alt="" />
                            <div>
                              <div className="flex items-baseline gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{r.author.displayName}</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: 'var(--color-text)' }}>{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="px-6 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                placeholder="Write a comment..."
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isPending}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors disabled:opacity-30"
                style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
