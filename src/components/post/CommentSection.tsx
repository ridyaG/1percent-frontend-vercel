import { useState } from 'react';
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

export default function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const { data: comments = [], isLoading } = useComments(postId, true);
  const { mutate: addComment, isPending } = useAddComment(postId);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(text.trim(), { onSuccess: () => setText('') });
  };

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Write a comment..."
          className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-sm outline-none
                     focus:ring-1 focus:ring-[#FF5C00]/50 placeholder-gray-600"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isPending}
          className="px-3 py-2 bg-[#FF5C00] text-white text-sm rounded-xl
                     disabled:opacity-40 hover:bg-[#FF5C00]/80 transition-colors"
        >
          {isPending ? '...' : 'Post'}
        </button>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-xs text-gray-600 text-center py-2">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-gray-600 text-center py-2">No comments yet — be the first!</div>
      ) : (
        <div className="space-y-3">
          {(comments as Comment[]).map(c => (
            <div key={c.id}>
              <div className="flex gap-2">
                <img
                  src={c.author.avatarUrl || getDefaultAvatar(c.author.username)}
                  className="w-7 h-7 rounded-full shrink-0 mt-0.5"
                  alt=""
                />
                <div className="flex-1">
                  <div className="bg-white/5 rounded-xl px-3 py-2">
                    <div className="text-xs font-semibold mb-0.5">
                      {c.author.displayName}
                      <span className="text-gray-500 font-normal ml-1">@{c.author.username}</span>
                    </div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 ml-2">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </div>
                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {c.replies.map(r => (
                        <div key={r.id} className="flex gap-2">
                          <img
                            src={r.author.avatarUrl || getDefaultAvatar(r.author.username)}
                            className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                            alt=""
                          />
                          <div className="flex-1">
                            <div className="bg-white/5 rounded-xl px-3 py-2">
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
          ))}
        </div>
      )}
    </div>
  );
}