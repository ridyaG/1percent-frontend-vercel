import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, Calendar, Target, X, ChevronRight } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';
import PostCard from '../components/post/PostCard';
import type { Post } from '../types/post';

// ── Types ──────────────────────────────────────────────────────────
interface Participant {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    currentStreak: number;
  };
  joinedAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description?: string;
  goal: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  creator: { id: string; username: string; displayName: string; avatarUrl?: string };
  participants?: Participant[];
  _count: { participants: number; posts: number };
}

// ── API helpers ────────────────────────────────────────────────────
const challengesApi = {
  list: () => api.get('/challenges').then(r => r.data.data as Challenge[]),
  getOne: (id: string) => api.get(`/challenges/${id}`).then(r => r.data.data as Challenge),
  create: (data: { title: string; description: string; goal: string; startDate: string; endDate: string }) =>
    api.post('/challenges', data).then(r => r.data.data as Challenge),
  join: (id: string) => api.post(`/challenges/${id}/join`),
  leave: (id: string) => api.delete(`/challenges/${id}/join`),
  getFeed: (id: string) => api.get(`/challenges/${id}/posts`).then(r => r.data.data),
};

// ── Create Modal ───────────────────────────────────────────────────
function CreateChallengeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', goal: '', startDate: '', endDate: ''
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => challengesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] });
      onClose();
    },
  });

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const valid = form.title && form.goal && form.startDate && form.endDate;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-5 pb-0">
          <h2 className="text-lg font-bold">Create Challenge</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
            <input value={form.title} onChange={update('title')} placeholder="30-Day Coding Sprint"
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Goal</label>
            <input value={form.goal} onChange={update('goal')} placeholder="Code for 1 hour every day"
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description (optional)</label>
            <textarea value={form.description} onChange={update('description')} placeholder="What's this challenge about?"
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00] resize-none h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date</label>
              <input type="date" value={form.startDate} onChange={update('startDate')}
                className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date</label>
              <input type="date" value={form.endDate} onChange={update('endDate')}
                className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={() => mutate()} disabled={!valid || isPending}
            className="px-5 py-2 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020] disabled:opacity-50 text-sm">
            {isPending ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Challenge Detail View ──────────────────────────────────────────
function ChallengeDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<'participants' | 'feed'>('participants');

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengesApi.getOne(id),
  });

  const { data: feed = [] } = useQuery({
    queryKey: ['challenge-feed', id],
    queryFn: () => challengesApi.getFeed(id),
    enabled: tab === 'feed',
  });

  const isJoined = challenge?.participants?.some(p => p.user.id === user?.id);

  const { mutate: join, isPending: joining } = useMutation({
    mutationFn: () => challengesApi.join(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenge', id] }),
  });

  const { mutate: leave, isPending: leaving } = useMutation({
    mutationFn: () => challengesApi.leave(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenge', id] }),
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 animate-pulse h-24" />
      ))}
    </div>
  );

  if (!challenge) return null;

  const today = new Date();

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - today.getTime()) / 86400000
    )
  );

  return (
    <div>
      <button onClick={onBack} className="text-gray-500 hover:text-white text-sm mb-4 flex items-center gap-1">
        ← Back to Challenges
      </button>

      {/* Header */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{challenge.title}</h2>
            {challenge.description && (
              <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-[#FF5C00] font-medium mb-4">
              <Target size={14} /> {challenge.goal}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {format(new Date(challenge.startDate), 'MMM d')} → {format(new Date(challenge.endDate), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {challenge._count.participants} participants
              </span>
              {daysLeft > 0 ? (
                <span className="text-[#FF5C00] font-semibold">{daysLeft} days left</span>
              ) : (
                <span className="text-gray-600">Ended</span>
              )}
            </div>
          </div>

          {isJoined ? (
            <button onClick={() => leave()} disabled={leaving}
              className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 rounded-lg text-sm transition-colors shrink-0">
              {leaving ? 'Leaving...' : 'Leave'}
            </button>
          ) : (
            <button onClick={() => join()} disabled={joining}
              className="px-4 py-2 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020] disabled:opacity-50 text-sm shrink-0">
              {joining ? 'Joining...' : 'Join Challenge'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
          <img src={challenge.creator.avatarUrl || getDefaultAvatar(challenge.creator.username)}
            className="w-5 h-5 rounded-full" alt="" />
          Created by <span className="text-white">@{challenge.creator.username}</span>
          · {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] border border-white/5 rounded-xl p-1 mb-4">
        {(['participants', 'feed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-[#FF5C00] text-white' : 'text-gray-500 hover:text-white'}`}>
            {t} {t === 'participants' ? `(${challenge._count.participants})` : `(${challenge._count.posts})`}
          </button>
        ))}
      </div>

      {/* Participants */}
      {tab === 'participants' && (
        <div className="space-y-2">
          {challenge.participants?.map(p => (
            <div key={p.user.id} className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl p-4">
              <img src={p.user.avatarUrl || getDefaultAvatar(p.user.username)}
                className="w-10 h-10 rounded-full" alt="" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.user.displayName}
                  <span className="text-gray-500 font-normal ml-1">@{p.user.username}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Joined {formatDistanceToNow(new Date(p.joinedAt), { addSuffix: true })}
                </div>
              </div>
              <div className="text-sm font-bold text-[#FF5C00]">{p.user.currentStreak}🔥</div>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      {tab === 'feed' && (
        <div>
          {feed.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📝</div>
              <div>No posts yet</div>
              <div className="text-sm text-gray-600 mt-1">Be the first to post in this challenge!</div>
            </div>
          ) : (
            feed.map((post: Post)  => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Challenge Card ─────────────────────────────────────────────────
function ChallengeCard({ challenge, onClick }: { challenge: Challenge; onClick: () => void }) {
  const today = new Date();

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - today.getTime()) / 86400000
    )
  );

  return (
    <div onClick={onClick}
      className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-3 hover:border-white/10 cursor-pointer transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold mb-1">{challenge.title}</h3>
          <div className="flex items-center gap-1 text-sm text-[#FF5C00] mb-3">
            <Target size={13} /> {challenge.goal}
          </div>
          {challenge.description && (
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{challenge.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users size={11} /> {challenge._count.participants} joined</span>
            <span className="flex items-center gap-1"><Calendar size={11} />
              {format(new Date(challenge.startDate), 'MMM d')} – {format(new Date(challenge.endDate), 'MMM d')}
            </span>
            {daysLeft > 0
              ? <span className="text-[#FF5C00] font-semibold">{daysLeft}d left</span>
              : <span className="text-gray-600">Ended</span>}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-600 shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function ChallengesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: challengesApi.list,
  });

  if (selectedId) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <ChallengeDetail id={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Active Challenges</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#FF5C00] text-white text-sm font-semibold rounded-lg hover:bg-[#ff7020] transition-colors">
          + Create Challenge
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">🏆</div>
          <div className="mb-1">No challenges yet</div>
          <div className="text-sm text-gray-600 mb-4">Create the first one and invite the community!</div>
          <button onClick={() => setShowCreate(true)}
            className="px-5 py-2 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020]">
            Create a Challenge
          </button>
        </div>
      ) : (
        challenges.map(c => (
          <ChallengeCard key={c.id} challenge={c} onClick={() => setSelectedId(c.id)} />
        ))
      )}

      {showCreate && <CreateChallengeModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
