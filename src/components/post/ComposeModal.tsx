import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { useUIStore } from '../../store/uiStore';
import toast from 'react-hot-toast';

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

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: () => postsApi.create({ content, postType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      close();
      toast.success('Posted! 🔥 Keep that streak going!');
    },
    onError: () => toast.error('Failed to post. Try again.'),
  });

  if (!open) return null;

  const remaining = 500 - content.length;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 pb-0">
          <h2 className="text-lg font-bold tracking-wide">Share your win today</h2>
          <button onClick={close} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4 flex-wrap">
          {POST_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setPostType(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                postType === t.value
                  ? 'border-[#FF5C00] text-[#FF5C00] bg-[#FF5C00]/10'
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you improve today? #fitness #coding #reading..."
          className="w-full bg-transparent p-5 text-white outline-none resize-none min-h-[120px] placeholder-gray-500"
          maxLength={500}
        />

        <div className="flex justify-between items-center p-5 pt-3 border-t border-white/5">
          <span className={`text-sm font-medium ${remaining < 50 ? 'text-red-500' : remaining < 150 ? 'text-yellow-500' : 'text-gray-500'}`}>
            {remaining}
          </span>
          <button
            onClick={() => createPost()}
            disabled={!content.trim() || isPending}
            className="px-5 py-2 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Posting...' : 'Post It'}
          </button>
        </div>
      </div>
    </div>
  );
}