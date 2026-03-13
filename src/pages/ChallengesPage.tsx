import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { Users, Calendar, Target, X, ChevronRight, ArrowLeft, Trophy, Sparkles, Plus } from 'lucide-react';
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

function getChallengeProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
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
  const today = new Date();
  const defaultStartDate = today.toISOString().slice(0, 10);
  const defaultEndDate = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

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

  const valid =
    Boolean(form.title.trim()) &&
    Boolean(form.goal.trim()) &&
    Boolean(form.startDate) &&
    Boolean(form.endDate) &&
    new Date(form.endDate) >= new Date(form.startDate);
  const fieldStyle = {
    background: 'color-mix(in srgb, var(--color-surface) 88%, white 12%)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  } as const;

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-box w-full max-w-xl"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 28%), var(--gradient-surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
              New challenge
            </div>
            <h2
              className="font-bold"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              Create a Challenge
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div
            className="rounded-[22px] p-4"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-bg) 78%, white 22%), color-mix(in srgb, var(--color-surface) 86%, white 14%))',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border) 80%)',
              boxShadow: 'inset 4px 0 0 0 var(--color-accent)',
            }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] mb-3"
              style={{ background: 'rgba(255,255,255,0.42)', color: 'var(--color-accent)' }}
            >
              <Sparkles size={12} />
              Quick guide
            </div>
            <div className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Start a shared sprint
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Define a clear title, a simple daily goal, and a timeline people can commit to.
            </p>
            <div className="mt-3 text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              Starts today by default and ends in 30 days.
            </div>
          </div>

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
                style={fieldStyle}
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
              style={fieldStyle}
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
                  style={fieldStyle}
                  min={f.key === 'endDate' ? form.startDate : defaultStartDate}
                />
              </div>
            ))}
          </div>

          {new Date(form.endDate) < new Date(form.startDate) && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(255, 107, 122, 0.08)',
                border: '1px solid rgba(255, 107, 122, 0.18)',
                color: 'var(--color-danger)',
              }}
            >
              End date must be the same day or later than the start date.
            </div>
          )}
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
  const progress = getChallengeProgress(challenge.startDate, challenge.endDate);

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
        className="card p-6 mb-4 overflow-hidden"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div
          className="mb-5 rounded-[24px] p-5"
          style={{
            background:
              'radial-gradient(circle at top right, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 30%), color-mix(in srgb, var(--color-surface) 84%, white 16%)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="eyebrow" style={{ marginBottom: 0 }}>
              <Trophy size={13} />
              Challenge hub
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: daysLeft > 0 ? 'var(--color-accent-bg)' : 'color-mix(in srgb, var(--color-surface) 82%, white 18%)',
                color: daysLeft > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                Progress
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                {Math.round(progress)}%
              </div>
            </div>
            <div className="glass-panel px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                Participants
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                {challenge._count.participants}
              </div>
            </div>
            <div className="glass-panel px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                Posts
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                {challenge._count.posts}
              </div>
            </div>
          </div>
        </div>

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
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span>Challenge timeline</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--color-surface) 78%, white 22%)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress}%`, background: 'var(--gradient-brand)', transition: 'width 240ms ease' }}
                />
              </div>
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
        className="flex gap-1 rounded-2xl p-1.5 mb-4"
        style={{ background: 'color-mix(in srgb, var(--color-surface) 88%, transparent)', border: '1px solid var(--color-border)' }}
      >
        {(['participants', 'feed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-xl text-sm font-semibold capitalize transition-all"
            style={{
              minHeight: '42px',
              background: tab === t ? 'var(--gradient-brand)' : 'transparent',
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
  const progress = getChallengeProgress(challenge.startDate, challenge.endDate);

  return (
    <div
      onClick={onClick}
      className="card card-interactive p-5 mb-4 overflow-hidden"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
        >
          {challenge.isActive ? 'Active challenge' : 'Archived challenge'}
        </span>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ background: 'color-mix(in srgb, var(--color-surface) 82%, white 18%)', color: 'var(--color-text-muted)' }}
        >
          {Math.round(progress)}% complete
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
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

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>Challenge progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--color-surface) 78%, white 22%)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: 'var(--gradient-brand)' }}
              />
            </div>
          </div>

          <div className="grid gap-3 text-xs sm:grid-cols-3" style={{ color: 'var(--color-text-muted)' }}>
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
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--color-surface) 82%, white 18%)', flexShrink: 0 }}
        >
          <ChevronRight size={18} style={{ color: 'var(--color-text-subtle)' }} />
        </div>
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

  const activeChallenges = challenges.filter(c => c.isActive).length;
  const totalParticipants = challenges.reduce((sum, challenge) => sum + challenge._count.participants, 0);

  if (selectedId) {
    return (
      <div className="page-container">
        <ChallengeDetail id={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="page-hero animate-fade-in">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow mb-3">
              <Sparkles size={14} />
              Group momentum
            </div>
            <h2 className="type-section mb-2">Challenges turn intention into shared consistency.</h2>
            <p className="section-copy">
              Join focused sprints, build public accountability, and keep your progress visible with a goal that has a deadline.
            </p>
          </div>

          <div className="w-full max-w-[440px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass-panel px-4 py-4 min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                  Active
                </div>
                <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                  {activeChallenges}
                </div>
              </div>
              <div className="glass-panel px-4 py-4 min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                  People in play
                </div>
                <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                  {totalParticipants}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary mt-3 w-full justify-center"
              style={{ borderRadius: '18px' }}
            >
              <Plus size={16} />
              Create challenge
            </button>
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className="section-title"
            style={{ color: 'var(--color-text)' }}
          >
            Active Challenges
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Pick a challenge with a clear finish line and visible accountability.
          </p>
        </div>
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
