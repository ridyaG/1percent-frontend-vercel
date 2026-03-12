import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useComments, useAddComment } from '../../hooks/useComments';
import { getDefaultAvatar } from '../../lib/utils';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl?: string };
  replies?: Comment[];
}

interface Props {
  postId: string;
  onClose: () => void;
}

export default function CommentSection({ postId, onClose }: Props) {
  const [text, setText] = useState('');
  const { data: comments = [], isLoading } = useComments(postId, true);
  const { mutate: addComment, isPending } = useAddComment(postId);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/10
                      rounded-t-3xl flex flex-col max-h-[75vh]
                      md:max-w-2xl md:mx-auto md:left-0 md:right-0">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h3 className="font-bold text-base">Comments</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 bg-white/5 rounded-full shrink-0" />
                  <div className="flex-1 bg-white/5 rounded-xl h-14" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-sm">No comments yet — be the first!</div>
            </div>
          ) : (
            (comments as Comment[]).map(c => (
              <div key={c.id}>
                <div className="flex gap-3">
                  <img
                    src={c.author.avatarUrl || getDefaultAvatar(c.author.username)}
                    className="w-8 h-8 rounded-full shrink-0 mt-0.5"
                    alt=""
                  />
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-2xl px-3 py-2.5">
                      <div className="text-xs font-semibold mb-1">
                        {c.author.displayName}
                        <span className="text-gray-500 font-normal ml-1">@{c.author.username}</span>
                      </div>
                      <div className="text-sm leading-relaxed">{c.content}</div>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1 ml-2">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-4 mt-3 space-y-3">
                        {c.replies.map(r => (
                          <div key={r.id} className="flex gap-2">
                            <img
                              src={r.author.avatarUrl || getDefaultAvatar(r.author.username)}
                              className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                              alt=""
                            />
                            <div className="flex-1">
                              <div className="bg-white/5 rounded-2xl px-3 py-2">
                                <div className="text-xs font-semibold mb-0.5">
                                  {r.author.displayName}
                                  <span className="text-gray-500 font-normal ml-1">@{r.author.username}</span>
                                </div>
                                <div className="text-sm">{r.content}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none
                       focus:ring-1 focus:ring-[#FF5C00]/50 placeholder-gray-600"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="px-4 py-2.5 bg-[#FF5C00] text-white text-sm font-semibold rounded-xl
                       disabled:opacity-40 hover:bg-[#FF5C00]/80 transition-colors"
          >
            {isPending ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </>
  );
}
