import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { getApiErrorMessage } from '../../api/errors';
import { useUIStore } from '../../store/uiStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { getDefaultAvatar } from '../../lib/utils';

const POST_TYPES = [
  { value: 'daily_win'      as const, label: 'Daily Win',      icon: '🏆' },
  { value: 'milestone'      as const, label: 'Milestone',      icon: '🎯' },
  { value: 'reflection'     as const, label: 'Reflection',     icon: '💭' },
  { value: 'challenge'      as const, label: 'Challenge',      icon: '⚡' },
  { value: 'goal_update'    as const, label: 'Goal Update',    icon: '📈' },
  { value: 'photo_progress' as const, label: 'Photo Progress', icon: '📸' },
];

const MAX_LENGTH = 500;

export default function ComposeModal() {
  const open        = useUIStore((s) => s.composeOpen);
  const close       = useUIStore((s) => s.closeCompose);
  const postType    = useUIStore((s) => s.selectedPostType);
  const setPostType = useUIStore((s) => s.setPostType);

  const [content, setContent] = useState('');
  const textareaRef           = useRef<HTMLTextAreaElement>(null);
  const queryClient           = useQueryClient();
  const setUser               = useAuthStore((s) => s.setUser);
  const user                  = useAuthStore((s) => s.user);

  const avatar = user?.avatarUrl || getDefaultAvatar(user?.username || 'user');

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [content]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  // Clear content when modal closes (runs on cleanup, avoids setState-in-effect warning)
  useEffect(() => {
    if (open) return;
    // Delay slightly so the modal exit animation isn't interrupted
    const id = setTimeout(() => setContent(''), 200);
    return () => clearTimeout(id);
  }, [open]);

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: () => postsApi.create({ content, postType }),
    onSuccess: (post) => {
      if (user && post.author?.currentStreak !== undefined) {
        setUser({ ...user, currentStreak: post.author.currentStreak });
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      close();
      toast.success(`🔥 Day ${post.author.currentStreak} — streak on!`, { duration: 3000 });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, { fallback: 'Failed to post. Please try again.', action: 'publish your post' })),
  });

  // ── handlePost defined with useCallback BEFORE the useEffect that uses it ──
  const handlePost = useCallback(() => {
    if (!content.trim() || isPending) return;
    createPost();
  }, [content, isPending, createPost]);

  // Keyboard shortcuts — uses handlePost, so must come after it
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handlePost();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close, handlePost]);

  if (!open) return null;

  const remaining   = MAX_LENGTH - content.length;
  const progressPct = Math.min((content.length / MAX_LENGTH) * 100, 100);
  const progressColor =
    remaining < 20 ? '#ef4444' :
    remaining < 80 ? '#eab308' :
    'var(--color-accent)';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal-box w-full max-w-lg animate-scale-in">

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
            <h2
              className="font-semibold text-sm"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              Share Your Win
            </h2>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
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

        {/* Post type pills */}
        <div className="px-5 pt-4 flex gap-2 flex-wrap">
          {POST_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setPostType(t.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: postType === t.value ? 'var(--color-accent)' : 'var(--color-surface-2)',
                color:      postType === t.value ? '#fff' : 'var(--color-text-muted)',
                border:    `1px solid ${postType === t.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Compose area */}
        <div className="flex gap-3 px-5 pt-4 pb-2">
          <img src={avatar} className="avatar avatar-md shrink-0 mt-0.5" alt="" />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you improve today? Use #hashtags to tag topics..."
              className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
              style={{
                color:      'var(--color-text)',
                caretColor: 'var(--color-accent)',
                minHeight:  '100px',
                maxHeight:  '300px',
              }}
              maxLength={MAX_LENGTH}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <circle
                cx="14" cy="14" r="11"
                fill="none"
                stroke={progressColor}
                strokeWidth="2.5"
                strokeDasharray={69.12}
                strokeDashoffset={69.12 * (1 - progressPct / 100)}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  transition: 'stroke-dashoffset 0.2s, stroke 0.2s',
                }}
              />
            </svg>
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: remaining < 20 ? '#ef4444' : 'var(--color-text-muted)' }}
            >
              {remaining}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              · ⌘↵ to post
            </span>
          </div>

          <button
            onClick={handlePost}
            disabled={!content.trim() || isPending}
            className="btn btn-primary px-5 py-2 text-sm"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Posting...
              </span>
            ) : (
              'Post It 🔥'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
