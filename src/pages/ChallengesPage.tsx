import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { Users, Calendar, Target, X, ChevronRight, ArrowLeft, Trophy } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getDefaultAvatar } from '../lib/utils';
import PostCard from '../components/post/PostCard';
import type { Post } from '../types/post';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────
interface Participant {
  user: {
    id: string; username: string; displayName: string;
    avatarUrl?: string; currentStreak: number;
  };
  joinedAt: string;
}
interface Challenge {
  id: string; title: string; description?: string; goal: string;
  startDate: string; endDate: string; isActive: boolean; createdAt: string;
  creator: { id: string; username: string; displayName: string; avatarUrl?: string };
  participants?: Participant[];
  _count: { participants: number; posts: number };
}

// ── API ────────────────────────────────────────────────────────────
const challengesApi = {
  list:    ()          => api.get('/challenges').then(r => r.data.data as Challenge[]),
  getOne:  (id:string) => api.get(`/challenges/${id}`).then(r => r.data.data as Challenge),
  create:  (data: { title: string; description: string; goal: string; startDate: string; endDate: string }) =>
    api.post('/challenges', data).then(r => r.data.data as Challenge),
  join:  (id:string) => api.post(`/challenges/${id}/join`),
  leave: (id:string) => api.delete(`/challenges/${id}/join`),
  getFeed: (id:string) => api.get(`/challenges/${id}/posts`).then(r => r.data.data),
};

// ── Create Modal ───────────────────────────────────────────────────
function CreateChallengeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', goal: '', startDate: '', endDate: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: () => challengesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge created!');
      onClose();
    },
    onError: () => toast.error('Failed to create challenge.'),
  });

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const valid = form.title && form.goal && form.startDate && form.endDate;

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box w-full max-w-lg">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            className="font-bold"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            Create a Challenge
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {[
            { label: 'Title',    key: 'title',    placeholder: '30-Day Coding Sprint',         type: 'text' },
            { label: 'Goal',     key: 'goal',     placeholder: 'Code for 1 hour every day',   type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {f.label}
              </label>
              <input
                type={f.type}
                value={(form as Record<string,string>)[f.key]}
                onChange={update(f.key)}
                placeholder={f.placeholder}
                className="input-base"
              />
            </div>
          ))}

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Description <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={update('description')}
              placeholder="What's this challenge about?"
              className="input-base resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Start Date', key: 'startDate' },
              { label: 'End Date',   key: 'endDate'   },
            ].map(f => (
              <div key={f.key}>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {f.label}
                </label>
                <input
                  type="date"
                  value={(form as Record<string,string>)[f.key]}
                  onChange={update(f.key)}
                  className="input-base"
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button onClick={onClose} className="btn btn-ghost text-sm">Cancel</button>
          <button
            onClick={() => mutate()}
            disabled={!valid || isPending}
            className="btn btn-primary text-sm"
          >
            {isPending ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Challenge Detail ───────────────────────────────────────────────
function ChallengeDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const qc   = useQueryClient();
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

  const { mutate: join,  isPending: joining  } = useMutation({
    mutationFn: () => challengesApi.join(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['challenge', id] }); toast.success('Joined!'); },
  });
  const { mutate: leave, isPending: leaving  } = useMutation({
    mutationFn: () => challengesApi.leave(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['challenge', id] }); toast.success('Left challenge.'); },
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton h-24 rounded-2xl" />
      ))}
    </div>
  );
  if (!challenge) return null;

  const daysLeft = Math.max(0, differenceInDays(new Date(challenge.endDate), new Date()));

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-4 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)')}
      >
        <ArrowLeft size={15} /> Back to Challenges
      </button>

      {/* Header card */}
      <div
        className="card p-6 mb-4"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              {challenge.title}
            </h2>
            {challenge.description && (
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                {challenge.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm font-medium mb-4" style={{ color: 'var(--color-accent)' }}>
              <Target size={14} /> {challenge.goal}
            </div>
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(challenge.startDate), 'MMM d')} → {format(new Date(challenge.endDate), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {challenge._count.participants} participants
              </span>
              {daysLeft > 0 ? (
                <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{daysLeft} days left</span>
              ) : (
                <span style={{ color: 'var(--color-text-subtle)' }}>Ended</span>
              )}
            </div>
          </div>

          {isJoined ? (
            <button
              onClick={() => leave()}
              disabled={leaving}
              className="btn btn-ghost text-sm shrink-0"
            >
              {leaving ? 'Leaving...' : 'Leave'}
            </button>
          ) : (
            <button
              onClick={() => join()}
              disabled={joining}
              className="btn btn-primary text-sm shrink-0"
            >
              {joining ? 'Joining...' : 'Join Challenge'}
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2 mt-4 pt-4 text-xs"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <img
            src={challenge.creator.avatarUrl || getDefaultAvatar(challenge.creator.username)}
            className="w-5 h-5 rounded-full"
            alt=""
          />
          Created by{' '}
          <span style={{ color: 'var(--color-text)' }}>@{challenge.creator.username}</span>
          · {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {(['participants', 'feed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? 'var(--color-accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {t} ({t === 'participants' ? challenge._count.participants : challenge._count.posts})
          </button>
        ))}
      </div>

      {/* Participants */}
      {tab === 'participants' && (
        <div className="space-y-2">
          {(challenge.participants ?? []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🙋</div>
              <div className="empty-state-title">No participants yet</div>
              <div className="empty-state-desc">Be the first to join!</div>
            </div>
          ) : challenge.participants?.map(p => (
            <div
              key={p.user.id}
              className="card flex items-center gap-3 p-4"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <img
                src={p.user.avatarUrl || getDefaultAvatar(p.user.username)}
                className="avatar avatar-md"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  {p.user.displayName}
                  <span className="font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    @{p.user.username}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                  Joined {formatDistanceToNow(new Date(p.joinedAt), { addSuffix: true })}
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                {p.user.currentStreak}🔥
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      {tab === 'feed' && (
        feed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No posts yet</div>
            <div className="empty-state-desc">Be the first to post in this challenge!</div>
          </div>
        ) : feed.map((post: Post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

// ── Challenge Card ─────────────────────────────────────────────────
function ChallengeCard({ challenge, onClick }: { challenge: Challenge; onClick: () => void }) {
  const daysLeft = Math.max(0, differenceInDays(new Date(challenge.endDate), new Date()));

  return (
    <div
      onClick={onClick}
      className="card card-interactive p-5 mb-3"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold mb-1"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            {challenge.title}
          </h3>
          <div
            className="flex items-center gap-1 text-sm font-medium mb-2"
            style={{ color: 'var(--color-accent)' }}
          >
            <Target size={13} /> {challenge.goal}
          </div>
          {challenge.description && (
            <p
              className="text-sm mb-3 line-clamp-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {challenge.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-1">
              <Users size={11} /> {challenge._count.participants} joined
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {format(new Date(challenge.startDate), 'MMM d')} – {format(new Date(challenge.endDate), 'MMM d')}
            </span>
            {daysLeft > 0
              ? <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{daysLeft}d left</span>
              : <span style={{ color: 'var(--color-text-subtle)' }}>Ended</span>
            }
          </div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function ChallengesPage() {
  const [showCreate,  setShowCreate ] = useState(false);
  const [selectedId,  setSelectedId ] = useState<string | null>(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: challengesApi.list,
  });

  if (selectedId) {
    return (
      <div className="page-container">
        <ChallengeDetail id={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
        >
          Challenges
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary text-sm"
        >
          + Create
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Trophy size={48} style={{ color: 'var(--color-accent)', opacity: 0.7 }} />
          </div>
          <div className="empty-state-title">No challenges yet</div>
          <div className="empty-state-desc mb-4">
            Create the first challenge and inspire the community!
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
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
