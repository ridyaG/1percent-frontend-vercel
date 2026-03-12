import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { useUIStore } from '../../store/uiStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const POST_TYPES = [
  { value: 'daily_win', label: '🏆 Daily Win' },
  { value: 'milestone', label: '🎯 Milestone' },
  { value: 'reflection', label: '💭 Reflection' },
  { value: 'challenge', label: '⚡ Challenge' },
] as const;

export default function ComposeModal() {
  const open = useUIStore((s) => s.composeOpen);
  const close = useUIStore((s) => s.closeCompose);
  const postType = useUIStore((s) => s.selectedPostType);
  const setPostType = useUIStore((s) => s.setPostType);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: () => postsApi.create({ content, postType }),
    onSuccess: (post) => {
      if (user && post.author?.currentStreak !== undefined) {
        setUser({ ...user, currentStreak: post.author.currentStreak });
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      close();
      toast.success(`Day ${post.author.currentStreak} 🔥 Keep that streak going!`);
    },
    onError: () => toast.error('Failed to post. Try again.'),
  });

  if (!open) return null;

  const remaining = 500 - content.length;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-lg rounded-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex justify-between items-center p-5 pb-0">
          <h2 className="text-lg font-bold tracking-wide" style={{ color: 'var(--color-text)' }}>
            Share your win today
          </h2>
          <button
            onClick={close}
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4 flex-wrap">
          {POST_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setPostType(t.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                border: `1px solid ${postType === t.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: postType === t.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                background: postType === t.value ? 'var(--color-accent-bg)' : 'transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you improve today? #fitness #coding #reading..."
          className="w-full p-5 outline-none resize-none min-h-[120px] bg-transparent"
          style={{
            color: 'var(--color-text)',
            caretColor: 'var(--color-accent)',
          }}
          maxLength={500}
        />

        <div
          className="flex justify-between items-center p-5 pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: remaining < 50 ? '#ef4444' : remaining < 150 ? '#eab308' : 'var(--color-text-muted)' }}
          >
            {remaining}
          </span>
          <button
            onClick={() => createPost()}
            disabled={!content.trim() || isPending}
            className="px-5 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
          >
            {isPending ? 'Posting...' : 'Post It'}
          </button>
        </div>
      </div>
    </div>
  );
}
