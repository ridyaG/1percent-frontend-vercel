import { useState, useEffect } from 'react';
import { X, Heart, Send } from 'lucide-react';
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#111] rounded-t-3xl
                      max-h-[85vh] md:max-w-lg md:mx-auto md:inset-x-0">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5 shrink-0">
          <h3 className="font-bold text-base">Comments <span className="text-gray-500 font-normal text-sm ml-1">{(comments as Comment[]).length}</span></h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Post preview */}
        <div className="px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex gap-3">
            <img
              src={post.author.avatarUrl || getDefaultAvatar(post.author.username)}
              className="w-9 h-9 rounded-full shrink-0"
              alt=""
            />
            <div>
              <div className="text-sm font-semibold">
                {post.author.displayName}
                <span className="text-gray-500 font-normal ml-1">@{post.author.username}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Heart size={12} /> {post._count?.likes ?? 0}</span>
                <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-white/5 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-24" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (comments as Comment[]).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">💬</div>
              <div className="text-sm">No comments yet</div>
              <div className="text-xs text-gray-600 mt-1">Be the first to comment!</div>
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
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="text-white font-semibold">{c.author.displayName}</span>
                    <span className="ml-1">@{c.author.username}</span>
                    <span className="mx-1">·</span>
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </div>
                  <p className="text-sm leading-relaxed">{c.content}</p>

                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-3 ml-2 pl-3 border-l border-white/10 space-y-3">
                      {c.replies.map(r => (
                        <div key={r.id} className="flex gap-2">
                          <img
                            src={r.author.avatarUrl || getDefaultAvatar(r.author.username)}
                            className="w-7 h-7 rounded-full shrink-0"
                            alt=""
                          />
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">
                              <span className="text-white font-semibold">{r.author.displayName}</span>
                              <span className="ml-1">· {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                            </div>
                            <p className="text-sm">{r.content}</p>
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
        <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3 shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Write a comment..."
            autoFocus
            className="flex-1 bg-white/5 rounded-2xl px-4 py-3 text-sm outline-none
                       focus:ring-1 focus:ring-[#FF5C00]/40 placeholder-gray-600"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="w-10 h-10 flex items-center justify-center bg-[#FF5C00] rounded-full
                       disabled:opacity-30 hover:bg-[#FF5C00]/80 transition-colors shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
