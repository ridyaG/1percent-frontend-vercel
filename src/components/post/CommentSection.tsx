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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161616] rounded-3xl shadow-2xl
                        flex flex-col max-h-[80vh] overflow-hidden
                        border border-white/8">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <h3 className="font-bold text-lg">Comments</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {(comments as Comment[]).length} comment{(comments as Comment[]).length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full
                         bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Post preview */}
          <div className="mx-6 mb-4 p-4 bg-white/4 rounded-2xl border border-white/5 shrink-0">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src={post.author.avatarUrl || getDefaultAvatar(post.author.username)}
                className="w-8 h-8 rounded-full"
                alt=""
              />
              <div>
                <div className="text-sm font-semibold leading-none">{post.author.displayName}</div>
                <div className="text-xs text-gray-500 mt-0.5">@{post.author.username}</div>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{post.content}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mx-6 shrink-0" />

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-white/5 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-2.5 bg-white/5 rounded w-28" />
                      <div className="h-8 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (comments as Comment[]).length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-sm font-medium">No comments yet</div>
                <div className="text-xs text-gray-600 mt-1">Start the conversation!</div>
              </div>
            ) : (
              (comments as Comment[]).map(c => (
                <div key={c.id} className="flex gap-3">
                  <img
                    src={c.author.avatarUrl || getDefaultAvatar(c.author.username)}
                    className="w-9 h-9 rounded-full shrink-0 mt-0.5"
                    alt=""
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-sm font-semibold">{c.author.displayName}</span>
                      <span className="text-xs text-gray-500">@{c.author.username}</span>
                      <span className="text-xs text-gray-600 ml-auto">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200">{c.content}</p>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-[#FF5C00]/30 space-y-3">
                        {c.replies.map(r => (
                          <div key={r.id} className="flex gap-2">
                            <img
                              src={r.author.avatarUrl || getDefaultAvatar(r.author.username)}
                              className="w-7 h-7 rounded-full shrink-0"
                              alt=""
                            />
                            <div>
                              <div className="flex items-baseline gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold">{r.author.displayName}</span>
                                <span className="text-xs text-gray-600">
                                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{r.content}</p>
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
          <div className="px-6 py-4 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5
                            focus-within:ring-1 focus-within:ring-[#FF5C00]/40 transition-all">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                placeholder="Write a comment..."
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-600"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isPending}
                className="w-8 h-8 flex items-center justify-center bg-[#FF5C00] rounded-xl
                           disabled:opacity-30 hover:bg-[#FF5C00]/80 transition-colors shrink-0"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
